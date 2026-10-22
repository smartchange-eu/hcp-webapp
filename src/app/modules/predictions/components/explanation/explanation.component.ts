import { PercentPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import { CodedValueConfig } from '@config/service/coded-values.config';
import {
  Card,
  Counterfactual,
  CounterfactualExplanation,
  ModelFeature,
  PatientCard,
  Shap,
  Suggestion,
} from '@eng-it4h/heart-ui-cdss';
import { CodedValue, Patient, Risk } from '@eng-it4h/heart-ui-model';
import { TranslateService } from '@ngx-translate/core';
import { BaseChartComponent, LegendPosition } from '@swimlane/ngx-charts';
import { RiskAttribute } from '../compliance-card/compliance-card.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { environment } from '@env/environment';
import { LogEvent } from '@modules/service/services/logging.decorator';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';

@Component({
  selector: 'heart-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
})
export class ExplanationComponent implements OnInit, OnChanges {
  @Input() suggestion?: Suggestion;
  @Input() card?: Card;
  @Input() lang!: string;
  @Input() visualExplainerUrl?: string;
  // shaps bar chart
  // options
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition = LegendPosition.Right;
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = false;
  showXAxisLabel: boolean = true;
  yAxisLabel: string = 'suggestion.detail.contribution.y.label';
  showYAxisLabel: boolean = false;
  xAxisLabel: string = 'suggestion.detail.contribution.x.label';
  showDataLabel: boolean = true;

  protected isDemo = environment.testEnv == 'true';
  protected colorSchema = CommonChartConf.colorScheme;
  protected areaSchema = CommonChartConf.areaColorScheme;
  protected shaps: any[] = []; // [{"name": "Germany","value": 8940000}, {...}]

  protected forecastedKeys: string[] = [];
  protected risks: Risk[] = [];
  protected ageCounterfactuals: Map<number, Counterfactual> = new Map();
  protected loading: boolean = false;
  protected currentAge: number = 0;
  protected counterfactualExpl?: CounterfactualExplanation;
  protected readonly colorMap: Map<string, string> = new Map<string, string>();

  protected riskattributes: RiskAttribute[] = [];

  protected negBars: any[] = [];
  @ViewChild('piechart') piechart?: BaseChartComponent;
  @ViewChild('barchart') barchart?: BaseChartComponent;
  constructor(
    private _translateService: TranslateService,
    private _db: DataBusService,
    private dialog: MatDialog,
  ) {}

  protected legendItems: { label: string; color: string }[] = [
    {
      label: 'explanation.legend.behavioral',
      color: this.colorSchema.domain[0],
    },
    {
      label: 'explanation.legend.pyhisological',
      color: this.colorSchema.domain[1],
    },
  ];
  private DIALOG_WIDTH = '800px';
  protected focusItems: { label: string; color: string }[] = [];
  protected focusColors: {
    name: string;
    value: string;
  }[] = [];
  protected customColors: {
    name: string;
    value: string;
  }[] = [];
  protected patient?: Patient;

  ngOnInit(): void {
    this.loading = true;
    this.patient = this._db.currentPatient;
    if (this.suggestion) {
      this.suggestion.features?.forEach((f) => {
        this.replaceFakeCodes(f);
      });
      this.prepareHBarChart(this.suggestion);
      if (this.suggestion.counterfactualExplanation) {
        this.suggestion.counterfactualExplanation.current.features?.forEach(
          (f) => {
            this.replaceFakeCodes(f);
          },
        );
        this.suggestion.counterfactualExplanation.forecasting.forEach((card) =>
          card.features?.forEach((f) => {
            this.replaceFakeCodes(f);
          }),
        );
        this.suggestion.counterfactualExplanation.counterfactuals.forEach(
          (cnt) => {
            cnt.forecasting.forEach((card) => {
              card.features?.forEach((f) => {
                this.replaceFakeCodes(f);
              });
            });
            cnt.overall.features?.forEach((f) => {
              this.replaceFakeCodes(f);
            });
          },
        );

        this.counterfactualExpl = this.suggestion.counterfactualExplanation;
        this.forecastedKeys =
          this.counterfactualExpl?.forecasting[0]?.features?.map(
            (f) => f.key.code,
          ) ?? [];
        this.sortCard(this.counterfactualExpl.current);
        this.counterfactualExpl.forecasting.forEach((c) => this.sortCard(c));
        this.currentAge = this.suggestion.counterfactualExplanation.current.age;
        this.sortForecasting();
        this.sortAgeCounterfactuals();
        this.risks =
          this.suggestion.actions
            ?.filter((a) => a.resource instanceof Risk)
            .map((a) => a.resource as Risk) || [];
      }
      this.riskattributes = this.prepareComplianceData();
    }
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lang'] && this.suggestion) {
      this.prepareHBarChart(this.suggestion);
      this.barchart?.update();
      this.piechart?.update();
    }
  }

  private prepareComplianceData(): RiskAttribute[] {
    const ret: RiskAttribute[] = [];
    this.suggestion?.compliance?.forEach((feature) => {
      if (feature.valueType == 'number') {
        let code = feature.key.code;
        let template = CodedValueConfig.getRiskAttributeTemplate(
          code,
          this.patient?.age,
          this.patient?.gender,
        );
        if (template) {
          ret.push(new RiskAttribute(code, template, feature.value));
        }
      }
    });

    return ret;
  }

  private replaceFakeCodes(f: Shap | ModelFeature) {
    if (f.key.code == 'to_do_link')
      f.key = new CodedValue(f.key.system, 'http://loinc.org/45636-8');
    if (f.key.code == 'to_find_link')
      f.key = new CodedValue(
        f.key.system,
        'http://smartchange.eu/fitness-speed',
      );
    if (f.key.code == 'some_link')
      f.key = new CodedValue(f.key.system, 'http://loinc.org/82290-8');
  }

  private prepareHBarChart(s: Suggestion, reload = true) {
    if (reload) {
      this.shaps = [];
      this.negBars = [];
    }
    if (s?.features) {
      s.features.sort((a, b) => b.contribution - a.contribution);
      s?.features
        .filter((s) => {
          return s?.contribution != undefined && s?.contribution != 0;
        })
        .forEach((f) => {
          const toTranslate = f.key.code;
          if (f.key.code != 'PLACEHOLDER') {
            const translated = this._translateService.instant(toTranslate);
            this.shaps.push({
              name: translated,
              value: Math.abs(f.contribution * 100),
            });
            this.negBars.push({
              name: translated,
              series: [
                {
                  name: translated,
                  value: f.contribution * 100,
                },
              ],
            });
            const color = this.getColor(f.key.code!);
            this.customColors.push({
              name: translated,
              value: color,
            });
            this.colorMap.set(f.key.uniqueLabelKey!, color);
          }
        });
    }
  }

  private sortAgeCounterfactuals() {
    if (
      this.suggestion?.counterfactualExplanation?.counterfactuals &&
      this.suggestion?.counterfactualExplanation?.counterfactuals.length > 0
    ) {
      const c = this.suggestion?.counterfactualExplanation?.counterfactuals[0];
      const currentAge = c.overall.age;

      const currentAgeCF = new Counterfactual();
      currentAgeCF.overall = this.suggestion.counterfactualExplanation?.current;
      currentAgeCF.forecasting = this.getOverall();
      this.ageCounterfactuals.set(currentAge, currentAgeCF);

      const forecastAges = c.forecasting.map((f) => f.age);
      forecastAges.forEach((age) => {
        const futureCF = new Counterfactual();
        const actualForecast =
          this.suggestion?.counterfactualExplanation?.forecasting.find(
            (f) => f.age === age,
          );
        if (actualForecast) {
          futureCF.overall = actualForecast;
        }
        futureCF.forecasting = this.getCounterfactualsByAge(age);
        this.ageCounterfactuals.set(age, futureCF);
      });
    }
  }

  getCurrentByAge(age: number): PatientCard | undefined {
    return this.suggestion?.counterfactualExplanation?.forecasting.find(
      (f) => f.age === age,
    );
  }

  showRisk(key: number) {
    return this.currentAge < key;
  }

  getCounterfactualsByAge(age: number): PatientCard[] {
    const ret: PatientCard[] = [];
    this.suggestion?.counterfactualExplanation?.counterfactuals.forEach((c) =>
      ret.push(...c.forecasting.filter((ff) => ff.age === age)),
    );
    ret.forEach((c) => this.sortCard(c));
    return ret;
  }

  sortForecasting() {
    this.suggestion?.counterfactualExplanation?.forecasting?.sort(
      (a, b) => a.age - b.age,
    ) ?? [];
  }

  getOverall(): PatientCard[] {
    const pc: PatientCard[] =
      this.suggestion?.counterfactualExplanation?.counterfactuals.map(
        (c) => c.overall,
      ) || [];
    pc.forEach((c) => this.sortCard(c));
    return pc;
  }

  sortCard(c: PatientCard) {
    c.features = c.features
      .filter(
        (f) =>
          this.forecastedKeys.some((k) => k == f.key.code) &&
          f.key.code != 'PLACEHOLDER' &&
          this.contributesToRisk(f),
      )
      .sort((a, b) =>
        (a.key as CodedValue).code.localeCompare((b.key as CodedValue).code),
      );
  }

  contributesToRisk(f: ModelFeature): boolean {
    const s = this.suggestion?.features?.find((s) => s.key.code == f.key.code);
    return s?.contribution != undefined && s?.contribution != 0;
  }

  formatTooltip(val: any): string {
    const perc = new PercentPipe('en_GB').transform(val.data.value)?.toString();
    const toRet = `${val.data.label} [${perc}]`;
    return toRet;
  }

  formatXAxis(val: any): string {
    return val + ' %';
  }

  getColor(l: string): string {
    let color = this.colorSchema.domain[2];
    const type = CodedValueConfig.featureType.get(l);
    switch (type) {
      case 'P':
        color = this.colorSchema.domain[1];
        break;
      case 'B':
        color = this.colorSchema.domain[0];
        break;
    }
    return color;
  }

  protected openDemoVE() {
    if (this.visualExplainerUrl && this.visualExplainerUrl.length > 0) {
      window.open(this.visualExplainerUrl, '_blank');
    }
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_OPENED_VISUAL_EXPLAINER)
  protected openVE() {
    if (this.visualExplainerUrl && this.visualExplainerUrl.length > 0) {
      const url = this.visualExplainerUrl + '/init/' + this.card?.uuid;
      window.open(url, '_blank');
    }
  }

  protected openHelpDialog(
    card: 'compliance' | 'impact' | 'forecast' | 'counterfactual',
    title?: string,
  ) {
    this.dialog.open(ConfirmationDialogComponent, {
      width: this.DIALOG_WIDTH,
      data: {
        title: title ?? 'risk.help.dialog.title',
        msg: card + '.help.content',
        okLabel: 'ok.label',
      },
    });
  }
}
