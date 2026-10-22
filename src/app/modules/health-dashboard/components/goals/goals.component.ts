import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { Card } from '@eng-it4h/heart-ui-cdss';
import {
  HealthCareProfessional,
  Patient,
  Plan,
} from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { SuggestionService } from '@modules/service/services/suggestion.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-goals-dashboard',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
})
export class GoalsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private DIALOG_WIDTH = '800px';

  public patient?: Patient;
  public plan?: Plan;
  public practitioner?: HealthCareProfessional;
  protected isDefault = false;
  protected suggestion?: Card;
  public constructor(
    protected dialog: MatDialog,
    private _databus: DataBusService,
    private _router: Router,
    private r: ActivatedRoute,
    private _predictionService: SuggestionService
  ) {}

  public ngOnInit(): void {
    this.patient = this._databus.currentPatient;
    this.practitioner = this._databus.currentPractitioner;
    this.suggestion = this._predictionService.latestCard;
    this._databus.currentPlan$
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => {
        this.isDefault =
          plan?.category?.code === CodedValueConfig.defaultPlanFocus.code;
        this.plan = plan;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  public async openPlanDefinitionDialog(): Promise<void> {
    const msg =
      this.plan && !this.isDefault
        ? 'plan-definition.update.plan.msg'
        : 'plan-definition.create.plan.msg';
    const title =
      this.plan && !this.isDefault
        ? 'plan-definition.update.plan.title'
        : 'plan-definition.create.plan.title';
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: title,
          msg: msg,
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this.takingCharge();
        }
      });
  }

  private async takingCharge(): Promise<void> {
    await this._router.navigate(['../plan'], { relativeTo: this.r });
  }

  get focus(): string {
    return this.plan?.category.uniqueLabelKey || '-';
  }
}
