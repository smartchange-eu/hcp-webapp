import { Component, Input, OnInit } from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import {
  CodedValue,
  GenericQuantitativeMeasure,
  QuantitativeMeasure,
} from '@eng-it4h/heart-ui-model';
import { TranslateService } from '@ngx-translate/core';
import { ChartTarget } from '../chart.target.model';
@Component({
  selector: 'target-card-barchart',
  templateUrl: './target-card-barchart.component.html',
  styleUrls: ['./target-card-barchart.component.scss'],
})
export class TargetCardBarchartComponent implements OnInit {
  @Input() goalTarget!: ChartTarget;

  @Input() measures!: QuantitativeMeasure[];

  chartData: any[] = [];
  lineChartData: any[] = [];
  average = 0;

  unit: string = '';

  constructor(private translate: TranslateService) {}
  ngOnInit(): void {
    this.processChartData();
    this.setupLineData();
    this.getUnitForTarget();
  }

  getUnitForTarget() {
    if (this.measures && this.measures.length > 0) {
      const base = this.measures[0];
      this.unit =
        base instanceof GenericQuantitativeMeasure && base.unit
          ? (base.unit as CodedValue).uniqueLabelKey
          : base.unitLabel;
    }
  }

  private processChartData(): void {
    this.chartData = this.measures.map((m) => {
      return {
        name: m.assertedWhen,
        value: m.value,
      };
    });

    const total = this.measures.reduce((acc, m) => acc + (m.value ?? 0), 0);
    this.average = this.measures.length ? total / this.measures.length : 0;
  }

  private setupLineData(): void {
    if (!this.chartData.length) return;

    this.lineChartData = [
      {
        name: this.translate.instant('target.chart.average'),
        value: this.average,
      },
    ];
    if (
      this.goalTarget.targetMin &&
      this.goalTarget.targetMax &&
      this.goalTarget.targetMin !== this.goalTarget.targetMax
    ) {
      this.lineChartData.push(
        {
          name: this.translate.instant('chart.target.min'),
          value: this.goalTarget.targetMin,
        },
        {
          name: this.translate.instant('chart.target.max'),
          value: this.goalTarget.targetMax,
        }
      );
    } else {
      this.lineChartData.push({
        name: this.translate.instant('target.chart.target'),
        value: this.goalTarget.targetMin ?? this.goalTarget.targetMax,
      });
    }
  }

  getDisplayName(code: CodedValue): string {
    return code.uniqueLabelKey;
  }

  getTargetDisplay(): string {
    if (this.goalTarget.targetMin === this.goalTarget.targetMax) {
      return `${this.goalTarget.targetMin}`;
    }
    return `${this.goalTarget.targetMin}-${this.goalTarget.targetMax}`;
  }

  getUnitDisplay(): string {
    return this.translate.instant(this.unit, { defaultValue: 'units' });
  }

  getTargetDisplayWithUnit(): string {
    const targetValue = this.getTargetDisplay();
    const unitDisplay = this.getUnitDisplay();
    return `${targetValue} ${unitDisplay}`;
  }

  getAverageDisplayWithUnit(): string {
    const unitDisplay = this.getUnitDisplay();
    return `${this.average.toFixed(1)} ${unitDisplay}`;
  }

  // this forces the same color for all bars
  protected customColors = (seriesName: string) => {
    return CommonChartConf.areaColorScheme.domain[0];
  };
}
