import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import {
  GenericQuantitativeFormComponent,
  QuantitativeLinechartComponent,
} from '@eng-it4h/heart-ui-measure';
import {
  GenericQuantitativeFormStructure,
  GenericQuantitativeMeasure,
  Measure,
  Patient,
} from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { LocaleService } from '@modules/service/services/locale.service';
import { StepComponent } from '@modules/stepper/step-component';
import { Subject, takeUntil } from 'rxjs';
import { EncounterService } from '../encounter.service';
import { PhysicalExaminationService } from './physical-examination.service';

@Component({
  selector: 'heart-physical-examination',
  templateUrl: './physical-examination.component.html',
  styleUrls: ['./physical-examination.component.scss'],
})
export class PhysicalExaminationComponent
  implements OnInit, StepComponent, OnDestroy
{
  private destroy$ = new Subject<void>();
  private debug = environment.debug && false;
  protected form: GenericQuantitativeFormStructure;
  protected date: boolean = false;
  protected notes: boolean = false;

  protected saving = false;
  protected measEditMode = true;

  protected lang: string;
  protected dateFormat = 'dd/MM/yyyy HH:mm';

  @ViewChild(GenericQuantitativeFormComponent)
  child?: GenericQuantitativeFormComponent;
  @ViewChildren(QuantitativeLinechartComponent)
  charts?: QueryList<QuantitativeLinechartComponent>;

  protected isActiveEpisode: boolean = false;
  protected measMap: Map<string, GenericQuantitativeMeasure[]> = new Map();
  protected keys: string[] = [];
  protected forTest?: GenericQuantitativeMeasure[];

  protected peMeasures?: Measure[];
  protected patient?: Patient;
  protected colorScheme = CommonChartConf.colorScheme;
  protected centilesSpan = CommonChartConf.percentilesTimespan;
  constructor(
    private _physExam: PhysicalExaminationService,
    private _localeService: LocaleService,
    private _snackBarService: SnackBarService,
    private _episodeService: EncounterService
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    this.form = this._physExam.getFormToRender();
    this.date = this._physExam.mandDate;
    this.notes = this._physExam.mandNotes;
    this.isActiveEpisode = this._episodeService.isEditable();
    this.peMeasures =
      this._episodeService.currentEncounter?.physical_examination;
    this.measEditMode = this.isActiveEpisode;
  }
  canDeactivate(): boolean {
    return true;
  }

  ngOnInit(): void {
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this.patient = this._episodeService.getCurrentPatient();

    this.prepareCharts();
    if (this.debug) {
      this.prepareForTest(3);
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private async prepareCharts() {
    if (!this.keys) {
      this.keys = [];
    }
    const meas = await this._physExam.retrieveAllMeasures(
      this.form,
      undefined,
      undefined
    );
    meas.forEach((m) => {
      let key;
      if (
        m instanceof GenericQuantitativeMeasure &&
        (m.value || m.components)
      ) {
        key = m.cvType.uniqueLabelKey;

        if (!this.measMap.has(key)) {
          this.measMap.set(key, []);
          this.keys.push(key);
        }
        this.measMap.get(key)?.push(m);
      }
    });
    this.charts?.forEach((c) => c.render());

    if (this.debug) {
      console.log(this.keys);
    }
  }

  async saveMeasures(meas: GenericQuantitativeMeasure[]) {
    this.saving = true;
    // aggiorna i grafici - DEBUG
    // this.prepareCharts(meas);
    // this.saving = false;
    // return;
    //end DEBUG
    try {
      // 0. set the patient object of the measurements

      if (this.debug) {
        console.log(meas);
        if (meas) {
          console.log(JSON.stringify(meas));
        }
      }

      // 1. call backend through the service
      const res = await this._physExam.save(meas, this.patient!);
      // aggiorna i grafici
      this.peMeasures = res;
      // switch alla modalità lettura
      this.changeEditMode(false);
      this.child?.correctlySaved();

      await this.prepareCharts();
      const msgKey = 'hcp.physical-examination.add.success.snack';
      const msg = this._localeService.translateService.instant(msgKey);

      this._snackBarService.openSnackBar(msg, undefined, 4000, 'snack-success'); // 'accent'
      this.saving = false;
    } catch (err) {
      if (this.debug) {
        console.error(err);
        // switch alla modalità lettura
        //   this.changeEditMode(true);
      }

      // 3. In case of error it shows a toast
      const msgKey = 'hcp.physical-examination.add.error.snack';
      this.saving = false;
      this._snackBarService.openSnackBar(
        msgKey,
        undefined,
        4000,
        'snack-error'
      ); // 'warn''
      this.saving = false;
      // this.child?.reValidateForm();
    }
  }

  private prepareForTest(tot: number) {
    const toRet: GenericQuantitativeMeasure[] = [];
    for (let i = 0; i < tot; i++) {
      let temp = this.measMap.get(this.keys[i]);
      if (temp) {
        toRet.push(...temp);
      }
    }
    this.forTest = toRet;
  }

  private changeEditMode(editMode: boolean): void {
    this.measEditMode = editMode;
  }

  get alreadyCollected(): GenericQuantitativeMeasure[] | undefined {
    return this.peMeasures
      ?.filter((m) => m instanceof GenericQuantitativeMeasure)
      .map((mm) => mm as GenericQuantitativeMeasure);
  }

  getPercentiles(key: string) {
    return CommonChartConf.getCentiles(key, this.patient?.gender);
  }
}
