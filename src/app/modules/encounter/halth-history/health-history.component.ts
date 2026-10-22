import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Encounter,
  EncounterQuestionnaire,
  Questionnaire,
  QuestionnaireResponse,
} from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { LocaleService } from '@modules/service/services/locale.service';
import { StepComponent } from '@modules/stepper/step-component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { EncounterService } from '../encounter.service';

@Component({
  selector: 'heart-health-history',
  templateUrl: './health-history.component.html',
  styleUrls: ['./health-history.component.scss'],
})
export class HealthHistoryComponent
  implements OnInit, OnDestroy, StepComponent
{
  private destroy$ = new Subject<void>();
  private readonly HEALTH_HISTORY: string;

  private readonly Q_TYPE = EncounterQuestionnaire.HEALTH_HISTORY;
  private debug = environment.debug || false;

  protected editMode = true;

  protected patientHistory?: QuestionnaireResponse;
  protected patientHistoryQuestionnaire?: Questionnaire;

  protected patientHistoryEditMode = true;
  protected pastEncountersWithFamily: Encounter[] = [];

  protected lang: string;

  protected loading: boolean = true;
  protected saving: boolean = false;

  protected isActiveEncounter: boolean = false;

  public constructor(
    private _localeService: LocaleService,
    private _snackBar: SnackBarService,
    private _encounterService: EncounterService
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    this.HEALTH_HISTORY = this._encounterService.getQuestionnaireURL(
      this.Q_TYPE
    )!;
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });

    // Fetches the questionnaire structure (it is needed both for new questionnaireresponse and for previous ones)
    await this.fetchPatientHistoryQuestionnaire();

    this._encounterService
      .observeCurrentCompleteEncounter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.loading = true;

        if (res) {
          this.isActiveEncounter = this._encounterService.isEditable();
          let oldQuestinnaire = res.getQuestionnaire(this.Q_TYPE);
          if (oldQuestinnaire != undefined) {
            this.pastEncountersWithFamily = [res];
            this.patientHistory = oldQuestinnaire;

            this.patientHistory.questionnaire =
              this.patientHistoryQuestionnaire!;
            this.patientHistoryEditMode = false;
          } else if (this._encounterService.isEditable()) {
            this.patientHistory = new QuestionnaireResponse(
              this.patientHistoryQuestionnaire!
            );
          } else {
            this.patientHistory = undefined;
          }
        }

        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public canDeactivate(): boolean {
    if (this.editMode) {
      return true;
    } else return true;
  }

  private async fetchPatientHistoryQuestionnaire(): Promise<void> {
    const qReference = new Questionnaire(this.HEALTH_HISTORY);

    try {
      const questionnaire =
        await this._encounterService.searchQuestionnaireByRef(qReference);
      if (questionnaire) {
        this.patientHistoryQuestionnaire = questionnaire;
      } else {
        const msg = this._localeService.translateService.instant(
          'questionnaire.error.not_found',
          { q: this.HEALTH_HISTORY }
        );
        this._snackBar.openSnackBar(msg, undefined, 10000, 'snack-error'); // 'warn''
        if (this.debug) {
          console.warn(`No questionnaire found for: ${this.HEALTH_HISTORY}`);
        }
      }
    } catch (error) {
      const msg = this._localeService.translateService.instant(
        'questionnaire.error.other',
        { q: this.HEALTH_HISTORY }
      );
      this._snackBar.openSnackBar(msg, undefined, 10000, 'snack-error'); // 'warn''
    }
  }

  protected async save(
    questionnaireResponse: QuestionnaireResponse,
    originalQuestionnaireResponse: QuestionnaireResponse
  ): Promise<void> {
    this.saving = true;
    try {
      if (this.debug) {
        console.log(questionnaireResponse);
      }

      // 1. call backend through the service
      this._encounterService
        .setQuestionnaire(questionnaireResponse, this.Q_TYPE)
        .then((res) => {
          // switch alla modalità lettura
          this.changeEditMode(false);

          const msgKey = 'hcp.add-anamnesis.add.success.snack';
          const msg = this._localeService.translateService.instant(msgKey);

          this.saving = false;
          this._snackBar.openSnackBar(msg, undefined, 4000, 'snack-success'); // 'accent'
        });
    } catch (err) {
      if (this.debug) {
        console.error(err);
        // switch alla modalità lettura
        this.changeEditMode(true);
      }

      // 3. In case of error it shows a toast
      const msgKey = 'hcp.add-anamnesis.add.error.snack';
      const msg = this._localeService.translateService.instant(msgKey);

      this.saving = false;
      this._snackBar.openSnackBar(msg, undefined, 4000, 'snack-error'); // 'warn''

      // this.child?.reValidateForm();
    }
  }

  protected modeChange(editMode: boolean): void {
    this.patientHistoryEditMode = editMode;
  }

  private changeEditMode(editMode: boolean): void {
    this.patientHistoryEditMode = editMode;
  }
}
