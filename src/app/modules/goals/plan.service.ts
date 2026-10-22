import { Injectable } from '@angular/core';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  CodedValue,
  GenericQuantitativeMeasure,
  Goal,
  HealthCareProfessional,
  NutritionItem,
  Patient,
  Plan,
  PlanDefinition,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LogEvent } from '@modules/service/services/logging.decorator';
import { UserEventsLogService } from '@modules/service/services/user-events-log.service';
import { addDays } from 'date-fns';
import { cloneDeep, remove } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NutritionItemPoint extends NutritionItem {
  collectedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private currentCompletePlanSubject: BehaviorSubject<Plan | undefined> =
    new BehaviorSubject<Plan | undefined>(undefined);

  private initialized = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.initialized.asObservable();

  private _planDefinitons: PlanDefinition[] = [];
  private _allGoals: Goal[] = [];
  private _patient?: Patient;
  private _allMeasures: GenericQuantitativeMeasure[] = [];
  private _nutritionItems: NutritionItemPoint[] = [];
  constructor(
    private _databus: DataBusService,
    private _backendService: HeartUiConnectorService,
    private eventLog: UserEventsLogService,
  ) {
    this.initialize();
  }

  public resetPlan(): void {
    this.currentCarePlan = cloneDeep(this._databus.currentPlan);
  }

  private async initialize() {
    await this.loadData();
    this._databus.patientDataReady$.subscribe((p) => {
      if (p && this._databus.currentPatient) {
        this._patient = this._databus.currentPatient;
        this.currentCarePlan = cloneDeep(this._databus.currentPlan);
      }
    });
    this.initialized.next(true);
  }

  private async loadData(): Promise<void> {
    this._planDefinitons = await this.findAllPlanDefinitions(); // Simulate async call
    this._allGoals = this._planDefinitons
      .flatMap((pd) => pd.goals)
      .filter((g) => this.isTargetGoal(g));
  }

  public async loadMeasures(p?: Patient, start?: Date): Promise<void> {
    if (p) {
      this._allMeasures =
        ((await this._backendService.measureConnector.searchByPatientAndType(
          p,
          [...CodedValueConfig.wearableCodes],
          start ? { from: start, to: new Date() } : undefined,
          undefined,
          true,
          true,
        )) as GenericQuantitativeMeasure[]) ?? [];
      this._allMeasures.sort(
        (a, b) => a.assertedWhen.getTime() - b.assertedWhen.getTime(),
      );
      const nutrition =
        (await this._backendService.nutritionConnector.searchByPatient(p)) ??
        [];

      nutrition.sort((a, b) => a.date.getTime() - b.date.getTime());
      this._nutritionItems =
        nutrition?.flatMap((n) =>
          (n.items ?? []).map((item) => ({
            ...item,
            collectedAt: n.date,
          })),
        ) ?? [];
    } else {
      this._allMeasures = [];
      this._nutritionItems = [];
    }
  }

  public initPlan(category: CodedValue): Plan {
    const plan = new Plan();

    plan.patient = this.patient;
    plan.author = this.hcp;

    plan.start = new Date();
    plan.due = addDays(new Date(), environment.planDuration ?? 30);
    plan.status = Plan.PlanStatus.DRAFT;
    plan.category = category;

    return plan;
  }

  public getPlanDefinitons(): PlanDefinition[] {
    const age = this.patient.age;
    if (age)
      return this._planDefinitons.filter((pd) => {
        return pd.ageRange == undefined || this.isInRange(pd.ageRange, age);
      });
    return this._planDefinitons;
  }

  private isInRange(
    ageRange: {
      min?: number;
      max?: number;
    },
    age: number,
  ): boolean {
    if (typeof age !== 'number' || isNaN(age)) {
      return false;
    }

    if (ageRange.min !== undefined && age < ageRange.min) {
      return false;
    }

    if (ageRange.max !== undefined && age > ageRange.max) {
      return false;
    }

    return true;
  }
  public get allGoalsDefinitions(): Goal[] {
    return this._allGoals;
  }

  public initPlanFromDef(plandefinition: PlanDefinition): Plan {
    const plan = new Plan();

    plan.patient = this.patient;
    plan.author = this.hcp;

    plan.start = new Date();
    plan.status = Plan.PlanStatus.DRAFT;
    plan.due = addDays(new Date(), environment.planDuration ?? 30);
    plan.category = plandefinition.focus;
    plan.goals = plandefinition.goals.map((g) => {
      g.status = Goal.GoalStatus.PROPOSED;
      g.subject = this.patient;
      return g;
    });
    return plan;
  }

  get patient() {
    return this._patient!;
  }

  public isNew(plan?: Plan): boolean {
    if (plan) {
      return plan.id == undefined;
    }
    return this.currentCarePlan?.id == undefined;
  }

  public isEditable(plan?: Plan) {
    if (plan) {
      return plan.status == Plan.PlanStatus.ACTIVE || Plan.PlanStatus.DRAFT;
    }
    return (
      this.currentCarePlan?.status == Plan.PlanStatus.ACTIVE ||
      Plan.PlanStatus.DRAFT
    );
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_REVOKED_PLAN)
  public async deletePlan(): Promise<void> {
    if (this.currentCarePlan) {
      if (this.currentCarePlan.id) {
        this.currentCarePlan.goals.forEach((g) => {
          g.status = Goal.GoalStatus.CANCELLED;
        });
        this.currentCarePlan.status = Plan.PlanStatus.REVOKED;
        await this._backendService.carePlanConnector.update(
          this.currentCarePlan,
        );
      }
      this.currentCarePlan = undefined;
      this._databus.currentPlan = undefined;
    }
  }

  private async deletePreviousPlan(): Promise<void> {
    const prevPlan = this._databus.currentPlan;
    if (prevPlan && prevPlan.status == Plan.PlanStatus.ACTIVE) {
      if (prevPlan.id) {
        prevPlan.goals.forEach((g) => {
          g.status = Goal.GoalStatus.CANCELLED;
        });
        prevPlan.status = Plan.PlanStatus.REVOKED;
        await this._backendService.carePlanConnector.update(prevPlan);
      }
      this._databus.currentPlan = undefined;
    }
  }

  private async saveOrUpdateCurrentPlan(): Promise<void> {
    if (!this.currentCarePlan) Promise.reject('a plan must exist');
    try {
      this.currentCarePlan!.status = Plan.PlanStatus.ACTIVE;
      const removed: Goal[] = remove(
        this.currentCarePlan!.goals,
        (g) => g.status == Goal.GoalStatus.CANCELLED,
      );
      if (this.currentCarePlan?.id) {
        this.eventLog.logEvent(USER_EVENT_CONSTANTS.USER_EDITED_GOAL);
        this.currentCarePlan =
          await this._backendService.carePlanConnector.update(
            this.currentCarePlan!,
          );
      } else {
        await this.deletePreviousPlan();
        this.currentCarePlan =
          await this._backendService.carePlanConnector.create(
            this.currentCarePlan!,
          );
      }
      if (removed.length > 0) {
        this.eventLog.logEvent(USER_EVENT_CONSTANTS.USER_REMOVED_GOAL);
        try {
          await this._backendService.goalConnector.deleteAll(removed);
          console.log('goals deleted');
        } catch (error) {
          console.error('Error deleting stale goals!');
        }
      }
      this.currentCarePlan = this.currentCarePlan;
      this._databus.currentPlan = this.currentCarePlan;
    } catch (err) {
      Promise.reject(err);
    }
  }

  private async findAllPlanDefinitions(): Promise<PlanDefinition[]> {
    return (
      await this._backendService.carePlanConnector.searchPlanDefinitions()
    )?.filter((p) => p.focus.code !== CodedValueConfig.defaultPlanFocus.code);
  }

  public getMeasuresByCode(code: CodedValue): GenericQuantitativeMeasure[] {
    return this._allMeasures.filter(
      (m) => m.cvType?.uniqueLabelKey === code.uniqueLabelKey,
    );
  }

  public getNutritionByCode(code: CodedValue): NutritionItemPoint[] {
    return this._nutritionItems.filter(
      (item) => item.product?.uniqueLabelKey === code.uniqueLabelKey,
    );
  }

  public isNutritionCode(code: CodedValue): boolean {
    return this._nutritionItems.some(
      (item) => item.product?.uniqueLabelKey === code.uniqueLabelKey,
    );
  }
  // da invocare solo quando effettivamente si aggiungono informazioni al care plan, altrimenti non viene salvato nulla
  public async mergeGoalsAndUpdatePlan(): Promise<void> {
    if (this.currentCarePlan !== undefined) {
      if (this.currentCarePlan.start == undefined) {
        this.currentCarePlan.start = new Date();
      }
      if (this.currentCarePlan.due) {
        this.currentCarePlan.goals.forEach((g) => {
          g.setGoalEndDate(this.currentCarePlan!.due!);
          g.subject = this.patient;
        });
      }
      await this.saveOrUpdateCurrentPlan();
    } else {
      return Promise.reject('No plan in session in order to add the attribute');
    }
  }

  public set currentCarePlan(completeP: Plan | undefined) {
    if (completeP) {
      this.currentCompletePlanSubject.next(completeP);
    } else {
      this.currentCompletePlanSubject.next(undefined); // tendenzialmente mai
    }
  }

  public observeCurrentCompletePlan(): Observable<Plan | undefined> {
    return this.currentCompletePlanSubject.asObservable();
  }

  public get currentCarePlan(): Plan | undefined {
    return this.currentCompletePlanSubject.value;
  }

  public get hcp(): HealthCareProfessional {
    return this._databus.currentPractitioner;
  }

  // utils method
  private isArrayOf<T>(
    array: any[],
    cls: new (...args: any[]) => T,
  ): array is T[] {
    for (let item of array) {
      if (item != null) return item instanceof cls;
    }
    return false;
  }

  public isChallenge(g: Goal): boolean {
    return (
      g.description !== undefined &&
      (g.targets === undefined || g.targets.length == 0)
    );
  }

  public isTargetGoal(g: Goal): boolean {
    return g.type !== undefined && g.targets?.length > 0;
  }
}
