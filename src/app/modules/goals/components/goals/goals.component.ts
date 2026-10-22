import { ChartTarget } from './../chart.target.model';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CodedValue,
  GenericQuantitativeMeasure,
  Goal,
  HealthCareProfessional,
  Note,
  Patient,
  Plan,
  QuantitativeTarget,
  RangeTarget,
  Target,
} from '@eng-it4h/heart-ui-model';
import { cloneDeep } from 'lodash';
import { GoalSelectionDialogComponent } from '../goal-selection-dialog/goal-selection.dialog';
import { NutritionItemPoint, PlanService } from '@modules/goals/plan.service';
import { CodedValueConfig } from '@config/service/coded-values.config';

@Component({
  selector: 'heart-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
})
export class GoalsComponent implements OnInit, OnChanges {
  @Input() public patient!: Patient;
  @Input() public practitioner!: HealthCareProfessional;
  @Input() public editable = false;
  @Output() public addNote: EventEmitter<Note> = new EventEmitter<Note>();

  @Input() public plan?: Plan;
  @Output() public planChange: EventEmitter<Plan> = new EventEmitter<Plan>();

  public loading: boolean = false;
  public loadingMeasures: boolean = false;
  public noPlan: boolean = false;

  public notes: string = '';
  public oldNotes: Note[] = [];

  public filteredGoals: Goal[] = [];

  public newGoals: Goal[] = [];
  protected allGoals: Goal[] = [];
  DIALOG_WIDTH = '550px';

  public constructor(
    private dialog: MatDialog,
    private planservice: PlanService
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.loadingMeasures = true;
    this.planservice.isInitialized$.subscribe((init) => {
      if (init) {
        if (!this.plan) {
          this.noPlan = true;
        } else {
          this.refreshComponent(this.plan);
        }
      }
    });
  }

  getNutritionItemsForTarget(target: {
    code: CodedValue;
  }): NutritionItemPoint[] {
    return this.planservice.getNutritionByCode(target.code);
  }
  codesMatch(c1?: CodedValue, c2?: CodedValue): boolean {
    return c1?.code === c2?.code && c1?.system === c2?.system;
  }

  getCodeFromTarget(target: any): string | null {
    const coding = target?.measure?.coding?.[0];
    if (!coding) return null;

    return `${coding.system}|${coding.code}`;
  }

  mapLineTarget(target: any): {
    code: string;
    targetMin: number;
    targetMax: number;
  } {
    const code = this.getCodeFromTarget(target);
    const range = target.detailRange || {};
    return {
      code: code ?? '',
      targetMin: range.low?.value ?? 0,
      targetMax: range.high?.value ?? 100,
    };
  }

  mapBarTarget(target: any): { code: string; targetValue: number } {
    const code = this.getCodeFromTarget(target);
    return {
      code: code ?? '',
      targetValue: target.detailQuantity?.value ?? 0,
    };
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const planChange = changes['plan'];

    if (
      planChange?.currentValue !== planChange?.previousValue &&
      planChange.currentValue
    ) {
      this.loading = true;
      this.refreshComponent(planChange.currentValue).finally(() => {
        this.loading = false;
      });
    }
  }

  private async refreshComponent(plan: Plan) {
    if (plan.therapeuticNotes?.length > 0) {
      this.oldNotes = plan.therapeuticNotes;
    }
    this.planservice
      .loadMeasures(this.patient)
      .finally(() => (this.loadingMeasures = false));
    this.allGoals = plan.goals?.length > 0 ? cloneDeep(plan.goals) : [];
    this.filterNewGoals(plan);
    this.loading = false;
  }

  private filterNewGoals(plan: Plan) {
    this.newGoals = this.planservice.allGoalsDefinitions.filter(
      (g) =>
        !this.allGoals.some(
          (gg) => this.getVariableName(gg) == this.getVariableName(g)
        )
    );
  }

  public get goals(): Goal[] {
    return this.allGoals.filter((g) => this.planservice.isTargetGoal(g));
  }

  public async updateTherapeuticNotes(): Promise<void> {
    const newNote: Note = new Note(this.practitioner, this.notes);
    this.addNote.emit(newNote);
  }

  public goalChangeEvent(item: { goal: Goal; operation: string }): void {
    if (item.goal && item.operation === 'save') {
      this.saveOrUpdatePlan(item.goal);
    } else if (item.goal && item.operation === 'update') {
      this.saveOrUpdatePlan(item.goal);
    } else if (item.goal && item.operation === 'delete') {
      this.removeGoal(item.goal);
    }
  }

  private saveOrUpdatePlan(goal: Goal): void {
    const index = this.plan!.goals.findIndex((m) => {
      return this.codesEqual(m.type, goal.type);
    });
    if (index > -1) {
      this.plan!.goals.splice(index, 1, goal);
    }
    this.save();
  }

  private removeGoal(goal: Goal): void {
    const index = this.plan!.goals.findIndex((m) => {
      return this.codesEqual(m.type, goal.type);
    });
    if (index > -1) {
      this.plan!.goals.splice(index, 1);
    }
    this.save();
  }

  public addGoal(newGoal: Goal): void {
    const goal = cloneDeep(newGoal);
    goal.recommender = this.practitioner;
    goal.status = Goal.GoalStatus.ACTIVE;
    goal.subject = this.patient;

    const index = this.plan!.goals.findIndex((m) => {
      this.codesEqual(m.type, goal.type);
    });

    if (index > -1) {
      this.saveOrUpdatePlan(newGoal);
    } else {
      this.plan!.goals.push(newGoal);
    }
    this.allGoals = cloneDeep(this.plan!.goals);
    this.save();
  }

  private codesEqual(c1?: CodedValue, c2?: CodedValue): boolean {
    if (c1 == undefined || c2 == undefined) {
      return false;
    }
    let ret = c1?.uniqueLabelKey == c2?.uniqueLabelKey;
    return ret;
  }

  private save(): void {
    this.planChange.emit(this.plan);
    if (this.plan?.goals && this.plan.goals.length > 0) {
      this.allGoals = cloneDeep(this.plan.goals);
      this.filterNewGoals(this.plan);
    }
  }

  isHistoryCode(code?: CodedValue): boolean {
    if (!code) return false;
    return CodedValueConfig.historyCodes.some((c) => c.code === code.code);
  }

  isWearableCode(code?: CodedValue): boolean {
    if (!code) return false;
    return CodedValueConfig.wearableCodes.some((c) => c.code === code.code);
  }

  isNutritionCode(code?: CodedValue): boolean {
    if (!code) return false;
    return this.planservice.isNutritionCode(code);
  }

  getChartTargets(): ChartTarget[] {
    return this.allGoals
      .filter((g) => this.planservice.isTargetGoal(g))
      .flatMap((g) => g.targets)
      .map((t) => this.mapToChartTarget(t))
      .flatMap((f) => (f ? [f] : []));
  }

  mapToChartTarget(target: Target): ChartTarget | undefined {
    if (
      target instanceof QuantitativeTarget &&
      target?.targetCode?.code &&
      target?.thresholdValue?.magnitude !== undefined
    ) {
      return {
        code: target.targetCode,
        targetMin: target.thresholdValue.magnitude,
        targetMax: target.thresholdValue.magnitude,
      };
    } else if (
      target instanceof RangeTarget &&
      target?.targetCode?.code &&
      (target?.maxThresholdValue?.magnitude !== undefined ||
        target?.minThresholdValue?.magnitude !== undefined)
    ) {
      return {
        code: target.targetCode,
        targetMin: target.minThresholdValue?.magnitude,
        targetMax: target.maxThresholdValue?.magnitude,
      };
    } else {
      return undefined;
    }
  }

  getMeasuresForTarget(target: {
    code: CodedValue;
  }): GenericQuantitativeMeasure[] {
    const mm = this.planservice.getMeasuresByCode(target.code);
    return mm;
  }

  openNewGoalDialog() {
    this.dialog
      .open(GoalSelectionDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          goals: this.newGoals,
        },
      })
      .afterClosed()
      .subscribe((res: Goal) => {
        if (res) {
          this.addGoal(res);
        }
      });
  }

  public getVariableName(goal: Goal): string {
    return goal.type?.uniqueLabelKey;
  }
}
