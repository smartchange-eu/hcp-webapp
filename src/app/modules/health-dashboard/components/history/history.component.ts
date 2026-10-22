import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  CentileValue,
  QuantitativeLinechartComponent,
} from '@eng-it4h/heart-ui-measure';
import {
  CodedValue,
  GenericQuantitativeMeasure,
  Measure,
  Nutrition,
  Patient,
  Questionnaire,
  QuestionnaireResponse,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LabUnitConversionService } from '@modules/service/services/lab-unit-conversion.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { SlofitDataService } from '@modules/service/services/slofit-data.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected lang: string;
  protected dateFormat = 'dd/MM/yyyy';
  protected loading = false;

  protected cvs: CodedValue[] = CodedValueConfig.historyCodes;
  protected loading1 = false;

  protected wearableCvs: CodedValue[] = CodedValueConfig.wearableCodes;
  protected slofitCvs: CodedValue[] = CodedValueConfig.slofitCodes;
  protected loading2 = false;
  protected labCvs: CodedValue[] = CodedValueConfig.labCodes;
  protected loading3 = false;

  protected historyCategory: string =
    CodedValueConfig.historyCategory.uniqueLabelKey;
  protected nutritionCategory: string =
    CodedValueConfig.nutritionCategory.uniqueLabelKey;
  protected wearableCategory: string =
    CodedValueConfig.wearableCategory.uniqueLabelKey;
  protected labCategory: string = CodedValueConfig.labCategory.uniqueLabelKey;
  protected measMap: Map<string, GenericQuantitativeMeasure[]> = new Map();
  protected wMMap: Map<string, GenericQuantitativeMeasure[]> = new Map();
  protected labMap: Map<string, GenericQuantitativeMeasure[]> = new Map();
  protected slofitMap: Map<string, GenericQuantitativeMeasure[]> = new Map();
  protected slofitMeasures: GenericQuantitativeMeasure[] = [];
  protected keys: string[] = [];
  protected wKeys: string[] = [];
  protected lKeys: string[] = [];
  protected slofitKeys: string[] = [];
  private debug = environment.debug && false;

  @ViewChildren(QuantitativeLinechartComponent)
  charts?: QueryList<QuantitativeLinechartComponent>;

  protected colorScheme = CommonChartConf.colorScheme;
  protected centilesSpan = CommonChartConf.percentilesTimespan;
  protected patient?: Patient;

  protected nutritionItems: Nutrition[] = [];
  protected loadingNutrition = false;

  protected latestHealthHistoryResponse?: QuestionnaireResponse;
  protected latestLifestyleResponse?: QuestionnaireResponse;

  protected showSlofit = false;

  protected questionnaires: {
    title: string;
    response: QuestionnaireResponse;
  }[] = [];
  protected loadingQ = false;
  protected loadingSlofit = false;

  private readonly QUESTIONNAIRE_URLS = CodedValueConfig.questionnaireRefs;

  constructor(
    private _localeService: LocaleService,
    private _dataBusService: DataBusService,
    private _backendService: HeartUiConnectorService,
    private _uiService: LabUnitConversionService,
    private _slofit: SlofitDataService,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this.loading = true;
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this.patient = this._dataBusService.currentPatient;
    this.showSlofit =
      this._slofit.enabled && this._slofit.connected(this.patient!);
    Promise.all([
      this.renderCharts(
        this.cvs,
        this.measMap,
        this.keys,
        false,
        this.loading1,
      ),
      this.renderCharts(
        this.wearableCvs,
        this.wMMap,
        this.wKeys,
        false,
        this.loading2,
      ),
      this.renderCharts(
        this.labCvs,
        this.labMap,
        this.lKeys,
        true,
        this.loading3,
      ),
      this.loadNutritionData(),
      this.loadQuestionnaireResponses(),
      this.loadSlofit(),
    ]);
    this.loading = false;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private prepareCharts(
    meas: Measure[],
    measMap: Map<string, Measure[]>,
    keys: string[],
  ) {
    meas.forEach((m) => {
      let key;
      if (
        m instanceof GenericQuantitativeMeasure &&
        (m.value != undefined || m.components)
      ) {
        key = m.cvType.uniqueLabelKey;
        if (!measMap.has(key)) {
          measMap.set(key, []);
          keys.push(key);
        }
        measMap.get(key)?.push(m);
      }
    });
    this.charts?.forEach((c) => c.render());
  }

  private async loadNutritionData(): Promise<void> {
    if (!this.patient) {
      return;
    }

    this.loadingNutrition = true;
    try {
      const nutritionData =
        await this._backendService.nutritionConnector.searchByPatient(
          this.patient,
        );

      if (nutritionData) {
        nutritionData.sort((a, b) => b.date.getTime() - a.date.getTime());
        this.nutritionItems = nutritionData;
      } else {
        this.nutritionItems = [];
      }
    } catch (error) {
      console.error('Error loading nutrition data', error);
      this.nutritionItems = [];
    } finally {
      this.loadingNutrition = false;
    }
  }

  async loadQuestionnaire(url: string, p: Patient): Promise<void> {
    try {
      const healthHistoryRef = new Questionnaire(url);
      const [healthHistoryResponses, healthHistoryQuestionnaire] =
        await Promise.all([
          this._backendService.questionnaireConnector.searchResponse(
            healthHistoryRef,
            p,
            undefined,
            true,
          ),
          this._backendService.questionnaireConnector.searchByReference(
            healthHistoryRef,
          ),
        ]);

      // FIXME: should not be necessary now that backend supports filtering only latest
      const latestHealthHistoryResponse = this.getLatestResponse(
        healthHistoryResponses,
      );

      if (latestHealthHistoryResponse && healthHistoryQuestionnaire?.items) {
        latestHealthHistoryResponse.questionnaire.items =
          healthHistoryQuestionnaire.items;
        this.questionnaires.push({
          title: url,
          response: latestHealthHistoryResponse,
        });
      }
    } catch (error) {
      console.error('Error loading questionnaire responses for: ' + url, error);
    } finally {
      this.loadingQ = false;
    }
  }

  private async loadQuestionnaireResponses(): Promise<void> {
    if (!this.patient) {
      return;
    }
    for (const url of this.QUESTIONNAIRE_URLS) {
      await this.loadQuestionnaire(url, this.patient);
    }
  }

  private async loadSlofit(): Promise<void> {
    if (
      !this.patient ||
      !this.showSlofit ||
      !this._slofit.connected(this.patient)
    ) {
      return;
    }
    this.loadingSlofit = true;

    try {
      const sloMeas = await this._slofit.getSlofitData(this.patient);

      if (sloMeas) {
        sloMeas.sort(
          (a, b) => b.assertedWhen.getTime() - a.assertedWhen.getTime(),
        );
        sloMeas.forEach((m) => {
          let key;
          if (
            m instanceof GenericQuantitativeMeasure &&
            (m.value != undefined || m.components)
          ) {
            key = m.cvType.uniqueLabelKey;
            if (!this.slofitMap.has(key)) {
              this.slofitMap.set(key, []);
              this.slofitKeys.push(key);
            }
            this.slofitMap.get(key)?.push(m);
          }
        });
        this.slofitMeasures = sloMeas;
      } else {
        this.slofitMeasures = [];
      }
    } catch (error) {
      console.error('Error loading nutrition data', error);
      this.slofitMeasures = [];
    } finally {
      this.loadingSlofit = false;
    }
  }

  private getLatestResponse(
    responses: QuestionnaireResponse[],
  ): QuestionnaireResponse | undefined {
    if (!responses || responses.length === 0) {
      return undefined;
    }
    return responses.reduce((latest, current) =>
      current.date.getTime() > latest.date.getTime() ? current : latest,
    );
  }

  private async renderCharts(
    cvs: CodedValue[],
    measMap: Map<string, Measure[]>,
    keys: string[],
    convert = false,
    loading: boolean,
  ) {
    const meas: Measure[] = await this.getMeasures(cvs);
    if (convert) this._uiService.convertMeasuresToUi(meas);

    meas.sort((a, b) => b.assertedWhen.getTime() - a.assertedWhen.getTime());
    this.prepareCharts(meas, measMap, keys);
    loading = false;
  }

  public async getMeasures(
    cvs: CodedValue[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<Measure[]> {
    return await this._backendService.measureConnector.searchByPatientAndType(
      this.patient!,
      cvs,
      startDate && endDate ? { from: startDate, to: endDate } : undefined,
      undefined,
      undefined,
      true,
    );
  }

  protected getCentilesForCode(
    key: string,
  ): Map<number, CentileValue[]> | undefined {
    return CommonChartConf.getCentiles(key, this.patient?.gender);
  }

  protected getValuesArray(
    map: Map<string, GenericQuantitativeMeasure[]>,
  ): GenericQuantitativeMeasure[] {
    return [...map.values()].flatMap((m) => m);
  }

  protected getSlofitData(): GenericQuantitativeMeasure[] {
    return this.slofitMeasures;
  }
}
