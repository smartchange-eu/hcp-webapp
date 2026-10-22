import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CareGiver,
  CodedValue,
  Encounter,
  EncounterStatus,
  GenericQuantitativeMeasure,
  Nutrition,
  Patient,
  Plan,
  Risk,
} from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { findOldestPrediction } from '@modules/service/services/oldest-prediction.function';
import { Subject, takeUntil } from 'rxjs';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { environment } from '@env/environment';
import { SHOW_CONTROL_RISK } from '@config/server-configuration.conf';

@Component({
  selector: 'heart-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected lang: string;
  protected DIALOG_WIDTH = '800px';
  protected patient?: Patient;
  protected family: CareGiver[] = [];
  protected loading: boolean = true;
  protected plan?: Plan;
  protected encounters: Encounter[] = [];
  protected oldEncounters: Encounter[] = [];
  protected trialGroup?: CodedValue;
  protected measures: GenericQuantitativeMeasure[] = [];
  protected nutrition: Nutrition[] = [];
  protected historyCodes: CodedValue[] = CodedValueConfig.summaryCodes;
  protected wearableCodes: CodedValue[] = CodedValueConfig.wearableCodes;
  protected historyTitle: string =
    CodedValueConfig.historyCategory.uniqueLabelKey;
  protected wearableTitle: string =
    CodedValueConfig.wearableCategory.uniqueLabelKey;
  protected nutritionTitle: string =
    CodedValueConfig.nutritionCategory.uniqueLabelKey;
  protected control = false;
  protected showRisk = false;
  public risks: Risk[] = [];

  protected predictionFilter = findOldestPrediction;
  protected initialRisk: Risk | undefined;

  constructor(
    private _localeService: LocaleService,
    private _snackBar: SnackBarService,
    private _dataBus: DataBusService,
    private _router: Router,
    private r: ActivatedRoute,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  public async ngOnInit(): Promise<void> {
    this.patient = this._dataBus.currentPatient;
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this._dataBus.currentRisks$
      .pipe(takeUntil(this.destroy$))
      .subscribe((risks) => {
        this.risks = risks;
      });
    this._dataBus.initialRisk$
      .pipe(takeUntil(this.destroy$))
      .subscribe((risk) => {
        this.initialRisk = risk;
      });
    this._dataBus.currentPlan$
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => {
        this.plan = plan;
      });
    this._dataBus.encounterList$
      .pipe(takeUntil(this.destroy$))
      .subscribe((encounters) => {
        this.encounters = encounters;
        this.oldEncounters =
          this.encounters.filter(
            (e) => e.status == EncounterStatus.COMPLETED,
          ) ?? [];
      });
    this._dataBus.family$.pipe(takeUntil(this.destroy$)).subscribe((fm) => {
      this.family = fm;
    });
    this._dataBus.measures$.pipe(takeUntil(this.destroy$)).subscribe((meas) => {
      this.measures = meas;
    });
    this._dataBus.nutrition$.pipe(takeUntil(this.destroy$)).subscribe((nut) => {
      this.nutrition = nut;
    });
    this._dataBus.patientDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });

    this._dataBus.currentGroup$
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => {
        this.trialGroup = p?.group;
        if (p) {
          this.control = p.group.code === 'control';
          this.showRisk = SHOW_CONTROL_RISK || !this.control;
        } else {
          this.control = false;
          this.showRisk = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasEncounterInProgress(): boolean {
    const result =
      this.encounters != undefined &&
      this.encounters.find((e) => e.status == EncounterStatus.INPROGRESS) !=
        undefined;

    return result;
  }

  protected encounterSelected(en?: Encounter) {
    let encounter: Encounter | undefined = en;
    if (!encounter) {
      encounter = this.encounters?.find(
        (e) => e.status == EncounterStatus.INPROGRESS,
      );
    }
    if (encounter == undefined) {
      return;
    } else {
      this._dataBus.currentEncounter = encounter;
      this._router
        .navigate(['../encounters/encounter'], { relativeTo: this.r })
        .then((navigated: boolean) => {
          if (encounter?.status == EncounterStatus.COMPLETED) {
            const msgKey = 'patient-dashboard.encounters.read-only';
            this._snackBar.openSnackBar(msgKey, undefined, 4000, 'snack');
          }
        })
        .catch((err) => {
          //snackbar e non muoverti dalla pagina
          this._snackBar.openSnackBar(err, undefined, 4000, 'snack-error');
        });
    }
  }
}
