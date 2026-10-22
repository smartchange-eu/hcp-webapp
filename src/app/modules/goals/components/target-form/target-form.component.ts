import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dictionary } from '@eng-it4h/heart-ui-converter';
import {
  CategoryTarget,
  QuantitativeTarget,
  RangeTarget,
  Target,
  TargetQuantity,
} from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { LocaleService } from '@modules/service/services/locale.service';
import { FormatPipe } from 'ngx-date-fns';

@Component({
  selector: 'heart-target-form',
  templateUrl: './target-form.component.html',
  styleUrls: ['./target-form.component.scss'],
})
export class TargetFormComponent implements OnInit {
  @Input()
  defaultDueDate?: Date;
  @Input() target!: Target;
  @Output() targetChange: EventEmitter<Target> = new EventEmitter<Target>();

  public categoryTargetValues: any;
  @Input() editable = false;
  public editMode: boolean = false;
  public isNotValidInput: boolean = false;
  public isCategoryTarget: boolean = false;
  public operator: string = '';
  public value?: number;
  public valueString?: string;
  public valueMin?: number;
  public valueMax?: number;
  public unit?: string;
  public customDueDate?: Date;
  public minDate: Date;
  private dateFormat: FormatPipe;
  DIALOG_WIDTH = '350px';

  constructor(
    protected dialog: MatDialog,
    private localeService: LocaleService,
    cd: ChangeDetectorRef
  ) {
    this.dateFormat = new FormatPipe(this.localeService.dateFns, cd);
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    if (this.target instanceof RangeTarget) {
      this.operator = 'BETWEEN';
      if (this.target.minThresholdValue) {
        this.valueMin = this.target.minThresholdValue.magnitude;
        this.unit = this.target.minThresholdValue.unit;
      }
      if (this.target.maxThresholdValue) {
        this.valueMax = this.target.maxThresholdValue.magnitude;
        if (!this.unit) {
          this.unit = this.target.maxThresholdValue.unit;
        }
      }
    } else if (this.target instanceof QuantitativeTarget) {
      this.operator = this.target.operator.toString();
      this.value = this.target.thresholdValue.magnitude;
      this.unit = this.target.thresholdValue.unit;
    } else if (this.target instanceof CategoryTarget) {
      this.isCategoryTarget = true;
      this.valueString = this.target.thresholdValue;
    }
    this.customDueDate = this.defaultDueDate;
  }

  public getVariableName(): string {
    if (this.target.targetCode) return this.target.targetCode.uniqueLabelKey;
    return 'unknown';
  }

  public checkInput() {
    if (this.isCategoryTarget) {
      if (this.valueString !== undefined && this.valueString !== null) {
        this.isNotValidInput = false;
      } else {
        this.isNotValidInput = true;
      }
    } else {
      if (this.operator === 'BETWEEN') {
        if (
          this.valueMin !== undefined &&
          this.valueMin !== null &&
          this.valueMax !== undefined &&
          this.valueMax !== null
        ) {
          if (this.valueMin < this.valueMax) {
            this.isNotValidInput = false;
          } else {
            this.isNotValidInput = true;
          }
        } else {
          this.isNotValidInput = true;
        }
      } else {
        if (this.value !== undefined && this.value !== null) {
          this.isNotValidInput = false;
        } else {
          this.isNotValidInput = true;
        }
      }
    }
  }

  public save(): void {
    const targetCode = this.target.targetCode;
    if (this.isCategoryTarget) {
      const newTarget = new CategoryTarget();
      newTarget.targetVariable = this.target.targetVariable as any;
      this.target = newTarget;
    } else {
      if (this.operator === 'BETWEEN') {
        const newTarget = new RangeTarget();
        newTarget.targetCode = targetCode;
        const min: TargetQuantity = new TargetQuantity(
          this.valueMin!,
          this.unit!,
          Dictionary.UNIT_OF_MEASURE
        );
        const max: TargetQuantity = new TargetQuantity(
          this.valueMax!,
          this.unit!,
          Dictionary.UNIT_OF_MEASURE
        );
        newTarget.minThresholdValue = min;
        newTarget.maxThresholdValue = max;
        newTarget.targetVariable = this.target.targetVariable as any;

        this.target = newTarget;
      } else {
        const newTarget = new QuantitativeTarget();
        newTarget.targetCode = targetCode;
        const newThreshold: TargetQuantity = new TargetQuantity(
          this.value!,
          this.unit!,
          Dictionary.UNIT_OF_MEASURE
        );
        newTarget.operator = QuantitativeTarget.RelationalOperator[
          QuantitativeTarget.RelationalOperator[this.operator as any] as any
        ] as any;
        newTarget.thresholdValue = newThreshold;
        newTarget.targetVariable = this.target.targetVariable as any;
        this.target = newTarget;
      }
    }
    this.editMode = false;
    this.targetChange.emit(this.target);
  }

  protected discardChanges(): void {
    this.editMode = false;
    this.initForm();
  }

  public openDiscardChangesDialog(): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'discard-changes.dialog.title',
          msg: 'discard-changes.dialog.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this.editMode = false;
          this.isNotValidInput = false;
          this.discardChanges();
        }
      });
  }

  public getNarrativeStringFromGoal(target: Target): string {
    const ts = this.localeService.translateService;
    let narrative: string = '';
    narrative = ts.instant(target?.targetCode.uniqueLabelKey);
    narrative += ' ' + ts.instant('goal.words.mustBe');

    if (target instanceof RangeTarget) {
      narrative += ' ' + ts.instant('goal.target.operator.between');
      if (target.minThresholdValue) {
        narrative += ` ${target.minThresholdValue.magnitude} `;
      }
      if (target.maxThresholdValue) {
        narrative +=
          ` ${ts.instant('goal.words.and')} ` +
          `${target.maxThresholdValue.magnitude} `;
      }
      const unit =
        target.maxThresholdValue?.unit ?? target.minThresholdValue?.unit;
      if (unit != undefined)
        narrative += `${ts.instant('goal.target.unit.' + unit)}`;
    } else if (target instanceof QuantitativeTarget) {
      narrative +=
        ` ${ts.instant(
          'goal.target.operator.' + target.operator?.toString()
        )} ` + `${target.thresholdValue.magnitude} `;
      if (
        target.thresholdValue.unit !== undefined &&
        target.thresholdValue.unit.length > 0
      ) {
        narrative += ` ${ts.instant(
          'goal.target.unit.' + target.thresholdValue.unit
        )} `;
      }
    } else if (target instanceof CategoryTarget) {
      narrative += ` ${ts.instant(
        'goal.target.threshold.value.' + target.thresholdValue?.toString()
      )} `;
    }
    return narrative;
  }
}
