import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Goal,
  HealthCareProfessional,
  Patient,
  QuantitativeTarget,
  Target,
} from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { LocaleService } from '@modules/service/services/locale.service';
import { FormatPipe } from 'ngx-date-fns';

@Component({
  selector: 'heart-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss'],
})
export class GoalCardComponent implements OnInit {
  @Input()
  goal!: Goal;
  @Input()
  defaultDueDate?: Date;
  @Input() practitioner!: HealthCareProfessional;
  @Input() patient!: Patient;
  @Output() goalChange: EventEmitter<{ goal: Goal; operation: string }> =
    new EventEmitter<{ goal: Goal; operation: string }>();

  @Input() editable = false;
  public isDefinedByMe: boolean = false;
  public disabledCommand: boolean = false;
  public isNotValidInput: boolean = false;
  public customDueDate?: Date;
  public minDate: Date;
  DIALOG_WIDTH = '350px';

  constructor(
    protected dialog: MatDialog,
    private localeService: LocaleService,
    cd: ChangeDetectorRef
  ) {
    this.minDate = new Date();
  }

  ngOnInit(): void {
    if (!this.goal?.id) {
      this.goal.subject = this.patient;
    }
    if (
      this.goal.recommender &&
      this.practitioner &&
      this.goal.recommender.id === this.practitioner.id
    ) {
      this.isDefinedByMe = true;
    }
    this.initForm();
  }

  initForm() {
    this.customDueDate = this.defaultDueDate;

    switch (this.goal.status) {
      case Goal.GoalStatus.ACTIVE:
      case Goal.GoalStatus.PLANNED: {
        this.disabledCommand = false;
        break;
      }
      case Goal.GoalStatus.NOT_APPROVED:
      case Goal.GoalStatus.ACHIEVED:
      case Goal.GoalStatus.FAILED:
      case Goal.GoalStatus.REJECTED:
      case Goal.GoalStatus.CANCELLED: {
        this.disabledCommand = true;
        break;
      }
    }
  }

  public getVariableName(): string {
    if (this.goal.type) return this.goal.type.uniqueLabelKey;
    return 'unknown';
  }

  public getDuration(): string {
    if (this.goal.durationInDays) {
      if (this.goal.durationInDays == 1)
        return this.localeService.translateService.instant('goal.duration.day');
      else if (this.goal.durationInDays == 7)
        return this.localeService.translateService.instant(
          'goal.duration.week'
        );
      else
        return this.localeService.translateService.instant(
          'goal.duration.n-days',
          { days: this.goal.durationInDays }
        );
    }
    return '';
  }

  protected removeGoal(): void {
    if (this.goal.id) {
      this.goal.status = Goal.GoalStatus.CANCELLED;
      this.save();
    } else {
      this.goalChange.emit({ goal: this.goal, operation: 'delete' });
    }
  }

  protected undoRemove(): void {
    this.goal.status = Goal.GoalStatus.ACTIVE;
    this.save();
  }

  targetChanged(): void {
    this.save();
  }

  private save(): void {
    if (this.goal.id) {
      // console.log('UPDATE');
      this.goalChange.emit({ goal: this.goal, operation: 'update' });
    } else {
      // console.log('SAVE');
      this.goalChange.emit({ goal: this.goal, operation: 'save' });
    }
  }
}
