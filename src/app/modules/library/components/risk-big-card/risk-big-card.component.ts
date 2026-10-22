import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CodedValue, Risk, RiskLevel } from '@eng-it4h/heart-ui-model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'heart-risk-big-card',
  templateUrl: './risk-big-card.component.html',
  styleUrls: ['./risk-big-card.component.scss'],
})
export class RiskBigCardComponent implements OnInit {
  @Input() risk?: Risk;
  @Input() showDate?: boolean = true;
  @Input() showActions?: boolean = true;

  @Output() public mitigation = new EventEmitter<string>();

  protected loading: boolean = true;
  protected sortedPredictions: Risk.Prediction[] = [];
  protected outcome: CodedValue = new CodedValue('', '', '');
  protected scaleMax = 60;
  multi: {
    name: string;
    series: {
      name: string;
      value: number;
      extra?: {
        min?: number;
        max?: number;
        age: number;
      };
    }[];
  }[] = [];
  // options
  showXAxis = true;
  showYAxis = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Age';
  showYAxisLabel = true;
  yAxisLabel = 'Risk (%)';

  customColors: {
    name: string;
    value: string;
  }[] = [];

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.loading = true;
    if (this.risk && this.risk.predictions?.length > 0) {
      this.sortedPredictions = this.sortByAge(this.risk?.predictions);
      this.outcome = this.sortedPredictions[0].code;
      this.xAxisLabel = this.translateService.instant(
        'risk-card.graph.x-label'
      );
      this.yAxisLabel = this.translateService.instant(
        'risk-card.graph.y-label'
      );
      this.prepareChartMulti();
    }
    this.loading = false;
  }

  private prepareChartMulti() {
    for (let index = 0; index < this.sortedPredictions.length; index++) {
      const element = this.sortedPredictions[index];
      const min = Math.round(element.range.min * 10000) / 100;
      const max = Math.round(element.range.max * 10000) / 100;
      const probability = Math.round(element.probability * 10000) / 100;

      if (max * 2 > this.scaleMax) this.scaleMax = max * 2;
      const minItem = {
        name: 'min' + element.age,
        value: min,
        extra: {
          min: min,
          max: max,
          age: element.age,
        },
      };
      const medItem = {
        name: 'med' + element.age,
        value: probability - min,
        extra: {
          min: min,
          max: max,
          age: element.age,
        },
      };
      const maxItem = {
        name: 'max' + element.age,
        value: max - probability,
        extra: {
          min: min,
          max: max,
          age: element.age,
        },
      };
      this.multi.push({
        name: '' + element.age,
        series: [minItem, medItem, maxItem],
      });
      this.customColors = [
        {
          name: 'min' + element.age,
          value: this.getColor(element.level),
        },
        {
          name: 'med' + element.age,
          value: this.getColor(element.level, true),
        },
        {
          name: 'max' + element.age,
          value: this.getColor(element.level, true),
        },
      ];
    }
    if (this.scaleMax > 100) this.scaleMax = 100;
  }

  getColor(l: RiskLevel, light?: boolean) {
    let color = 'blue';
    if (l === RiskLevel.LOW) {
      color = light ? '#538a53ff' : 'green';
    } else if (l === RiskLevel.MODERATE) {
      color = light ? '#8a8953ff' : 'yellow';
    } else if (l === RiskLevel.HIGH) {
      color = light ? '#8a5353ff' : 'red';
    }
    return color;
  }

  private sortByAge(pr: Risk.Prediction[]): Risk.Prediction[] {
    if (!pr || pr.length === 0) {
      return [];
    }

    return pr.slice().sort((a, b) => a.age - b.age);
  }

  public showMitigation() {
    this.mitigation.emit(this.risk?.mitigation);
  }

  riskValueFormatter(value: any) {
    return value + ' %';
  }
}
