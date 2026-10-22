import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-teacher-health-history',
  templateUrl: './teacher-health-history.component.html',
  styleUrls: ['./teacher-health-history.component.scss'],
})
export class TeacherHealthHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected lang: string;
  protected dateFormat = 'dd/MM/yyyy';

  protected loading = false;
  protected loadingNutrition = false;

  protected centilesSpan = 24;
  protected colorScheme = CommonChartConf.colorScheme;

  protected cvs: CodedValue[] = CodedValueConfig.wearableCodes;
  protected historyCategory: string =
    CodedValueConfig.wearableCategory.uniqueLabelKey;

  protected nutritionCategory: string =
    CodedValueConfig.nutritionCategory.uniqueLabelKey;

  protected measMap: Map<string, GenericQuantitativeMeasure[]> = new Map();
  protected keys: string[] = [];

  protected nutritionItems: Nutrition[] = [];

  @ViewChildren(QuantitativeLinechartComponent)
  charts?: QueryList<QuantitativeLinechartComponent>;
  @ViewChild('physical') physical?: ElementRef;
  @ViewChild('nutrition') nutrition?: ElementRef;

  protected patient?: Patient;
  protected patientId?: string;

  private debug = environment.debug && false;

  constructor(
    private _localeService: LocaleService,
    private _dataBusService: DataBusService,
    private _backendService: HeartUiConnectorService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this.loading = true;

    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => (this.lang = res.lang));

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.patientId = params['patientId'];
      if (this.patientId) {
        this.loadPatientData();
      } else {
        if (this.debug) console.error('DEBUG: No patient ID in route params');
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadPatientData(): Promise<void> {
    if (!this.patientId) {
      if (this.debug) console.error('DEBUG: No patient ID available');
      return;
    }
    this.patient = this._dataBusService.patientsList.find((p) => {
      return p.fhirId == this.patientId;
    });
    if (this.patient) {
      await this.loadHealthData();
    } else {
      if (this.debug) {
        console.error('DEBUG: Patient not found');
      }
      this.router.navigate(['/web/teacher/students-registry']);
    }
  }

  private async loadHealthData(): Promise<void> {
    if (!this.patient) {
      if (this.debug)
        console.error('DEBUG: No patient available for loading health data');
      this.loading = false;
      return;
    }

    try {
      this.loadingNutrition = true;

      await this.renderCharts(this.cvs, this.measMap, this.keys);

      await this.loadNutritionData();
    } catch (error) {
      if (this.debug) console.error('DEBUG: Error loading health data:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadNutritionData(): Promise<void> {
    if (!this.patient) return;

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

  private async renderCharts(
    cvs: CodedValue[],
    measMap: Map<string, GenericQuantitativeMeasure[]>,
    keys: string[],
  ) {
    let meas: Measure[] = await this.getMeasures(cvs);
    // if (convert) meas = this._uiService.convertMeasuresToUi(meas);
    meas.sort((a, b) => b.assertedWhen.getTime() - a.assertedWhen.getTime());
    this.prepareCharts(meas, measMap, keys);
  }

  private async getMeasures(
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

  private prepareCharts(
    meas: Measure[],
    measMap: Map<string, GenericQuantitativeMeasure[]>,
    keys: string[],
  ) {
    meas.forEach((m) => {
      if (
        m instanceof GenericQuantitativeMeasure &&
        (m.value != undefined || (m as GenericQuantitativeMeasure).components)
      ) {
        const key = m.cvType.uniqueLabelKey;

        if (!measMap.has(key)) {
          measMap.set(key, []);
          keys.push(key);
        }

        const arr = measMap.get(key)!;
        arr.push(m as GenericQuantitativeMeasure);
      }
    });

    for (const [k, arr] of measMap.entries()) {
      arr.sort((a, b) => a.assertedWhen.getTime() - b.assertedWhen.getTime());
      measMap.set(k, arr);
    }
  }

  protected getLatestMeasures(key: string): GenericQuantitativeMeasure[] {
    const measures = this.measMap.get(key) || [];
    return measures.slice(0, 1);
  }

  protected hasChartComponent(): boolean {
    return true;
  }

  protected hasNutritionChart(): boolean {
    return true;
  }

  scrollTo(bookmark: 'physical' | 'nutrition') {
    switch (bookmark) {
      case 'physical':
        this.physical?.nativeElement.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'nutrition':
        this.nutrition?.nativeElement.scrollIntoView({ behavior: 'smooth' });
        break;
    }
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

  protected goBack(): void {
    this.router.navigate(['/web/teacher/students-registry']);
  }
}
