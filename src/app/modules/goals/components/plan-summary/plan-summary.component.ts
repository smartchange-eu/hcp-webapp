import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PrinciplesConfiguration } from '@config/translations/principles.conf';
import { Card } from '@eng-it4h/heart-ui-cdss';
import {
  Goal,
  HealthCareProfessional,
  Patient,
  Plan,
} from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { PlanService } from '@modules/goals/plan.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { SuggestionService } from '@modules/service/services/suggestion.service';

@Component({
  selector: 'heart-plan-summary',
  templateUrl: './plan-summary.component.html',
  styleUrls: ['./plan-summary.component.scss'],
})
export class PlanSummaryComponent implements OnInit, OnDestroy {
  protected lang: string;
  protected plan?: Plan;
  protected patient?: Patient;
  protected practitioner?: HealthCareProfessional;
  protected loading = false;
  protected minDate = new Date();
  protected DIALOG_WIDTH = '800px';
  protected suggestion?: Card;
  public constructor(
    private router: Router,
    private _dialog: MatDialog,
    private _planService: PlanService,
    private _localeService: LocaleService,
    private sanitizer: DomSanitizer,
    private r: ActivatedRoute,
    private _predictionService: SuggestionService
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this.loading = true;
    this.plan = this._planService.currentCarePlan;
    this.patient = this._planService.patient;
    this.practitioner = this._planService.hcp;
    this.suggestion = this._predictionService.latestCard;
    if (this.plan) this.loading = false;
  }

  ngOnDestroy(): void {
    this._planService.resetPlan();
  }

  public get challanges(): Goal[] {
    return (
      this.plan?.goals?.filter((g) => this._planService.isChallenge(g)) || []
    );
  }

  save() {
    const msg = this._localeService.translateService.instant(
      'save-care-plan-dialog.msg',
      { username: this.patient?.getFullName() }
    );
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      width: this.DIALOG_WIDTH,
      data: {
        title: 'save-care-plan-dialog.title',
        msg: msg,
        closeLabel: 'answer.no.label',
        okLabel: 'answer.yes.label',
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res == true) {
        this._planService.currentCarePlan = this.plan!;
        this._planService
          .mergeGoalsAndUpdatePlan()
          .then(() => {
            this.router.navigateByUrl('/web/hcp/dashboard/goals');
          })
          .catch(() => {
            //TODO: add snackbar
          })
          .finally(() => {
            this._planService.resetPlan();
          });
      }
    });
  }

  back() {
    this._planService.resetPlan();
    this.router.navigateByUrl('/web/hcp/dashboard/goals');
  }

  openDeletePlanDialog() {
    this._dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'plan-definition.delete.plan.title',
          msg: 'plan-definition.delete.plan.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._planService
            .deletePlan()
            .then(() => {
              this.router.navigateByUrl('/web/hcp/dashboard/goals');
            })
            .catch(() => {
              //TODO: add snackbar
            });
        }
      });
  }

  cancel() {
    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      width: this.DIALOG_WIDTH,
      data: {
        title: 'cancel-plan-dialog.title',
        msg: 'cancel-plan-dialog.msg',
        closeLabel: 'answer.no.label',
        okLabel: 'answer.yes.label',
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res == true) {
        this._planService.resetPlan();
        this.router.navigate(['../new'], { relativeTo: this.r });
      }
    });
  }

  get principlesContent() {
    return this.sanitizer.bypassSecurityTrustHtml(
      PrinciplesConfiguration.getContent(this.lang)
    );
  }
  getPlanTitle() {
    let msg = this._localeService.translateService.instant('plan.focus.title');
    msg += this._localeService.translateService.instant(
      this.plan?.category.uniqueLabelKey!
    );
    return msg;
  }

  isNewPlan(): boolean {
    return this._planService.isNew();
  }
}
