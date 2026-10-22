import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Goal,
  HealthCareProfessional,
  Patient,
  Plan,
  PlanDefinition,
} from '@eng-it4h/heart-ui-model';

import { PlanService } from '@modules/goals/plan.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { PrinciplesConfiguration } from '@config/translations/principles.conf';
import { DomSanitizer } from '@angular/platform-browser';
import { SuggestionService } from '@modules/service/services/suggestion.service';
import { Card } from '@eng-it4h/heart-ui-cdss';

@Component({
  selector: 'heart-plan-definition',
  templateUrl: './plan-definition.component.html',
  styleUrls: ['./plan-definition.component.scss'],
})
export class PlanDefinitionComponent implements OnInit {
  public patient?: Patient;
  public selectedPlanD?: PlanDefinition;
  public planDefinitions: PlanDefinition[] = [];
  public planGoals: Goal[] = [];
  public loading = false;
  protected lang: string;
  protected practitioner?: HealthCareProfessional;
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

  public ngOnInit(): void {
    this.loading = true;
    // reset any unsaved plan
    this.suggestion = this._predictionService.latestCard;
    const defaultFocus = this.suggestion?.suggestions
      ?.at(0)
      ?.riskScores?.sort((a, b) => a.value - b.value)
      ?.at(0)?.key?.code;
    this._planService.currentCarePlan = undefined;
    this._planService.isInitialized$.subscribe((init) => {
      if (init) {
        this.patient = this._planService.patient;
        this.planDefinitions = this._planService.getPlanDefinitons();
        if (defaultFocus)
          this.selectedPlanD = this.planDefinitions.find((pd) =>
            defaultFocus.endsWith(pd.focus.code)
          );
        this.loading = false;
      }
    });
  }

  public get challanges(): Goal[] {
    if (this.selectedPlanD) {
      return this.selectedPlanD.goals.filter((g) =>
        this._planService.isChallenge(g)
      );
    } else return [];
  }

  get principlesContent() {
    return this.sanitizer.bypassSecurityTrustHtml(
      PrinciplesConfiguration.getContent(this.lang)
    );
  }
  public get goals(): Goal[] {
    if (this.selectedPlanD) {
      return this.selectedPlanD.goals.filter((g) =>
        this._planService.isTargetGoal(g)
      );
    } else return [];
  }

  public onConfirm(): void {
    if (this.selectedPlanD) {
      const newPlan: Plan = this._planService.initPlanFromDef(
        this.selectedPlanD
      );
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'save-plan-dialog.title',
          msg: 'save-plan-dialog.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      });

      dialogRef.afterClosed().subscribe((res) => {
        if (res == true) {
          this._planService.currentCarePlan = newPlan;
          this.goToEditPlan();
        }
      });
    }
  }

  public async goToEditPlan() {
    this.router.navigate(['../edit'], { relativeTo: this.r });
  }
}
