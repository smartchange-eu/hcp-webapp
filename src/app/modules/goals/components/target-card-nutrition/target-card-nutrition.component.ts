import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import { CodedValue } from '@eng-it4h/heart-ui-model';
import { NutritionItemPoint } from '@modules/goals/plan.service';
import { TranslateService } from '@ngx-translate/core';
import { ChartTarget } from '../chart.target.model';

@Component({
  selector: 'target-card-nutrition',
  templateUrl: './target-card-nutrition.component.html',
  styleUrls: ['./target-card-nutrition.component.scss'],
})
export class TargetCardNutritionComponent implements OnInit {
  @Input() goalTarget!: ChartTarget;
  @Input() items: NutritionItemPoint[] = [];

  chartData: { name: Date; value: number }[] = [];
  lineChartData: any[] = [];
  average = 0;
  unit = '';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    if (this.goalTarget && this.items.length) {
      this.prepareChart();
    }
  }

  prepareChart() {
    const targetCode = this.goalTarget.code;
    if (!targetCode) return;

    const filteredItems = this.items.filter((item) =>
      this.codesMatch(item.product, targetCode),
    );

    if (!filteredItems.length) return;

    const values = filteredItems.map((i) => i.quantity ?? 0);
    const dates = filteredItems.map((i) => i.collectedAt);

    this.average = values.reduce((sum, v) => sum + v, 0) / values.length;
    this.unit = filteredItems[0].unit.code ?? '';

    this.chartData = values.map((v, i) => ({
      name: dates[i],
      value: v,
    }));
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
        },
      );
    } else {
      this.lineChartData.push({
        name: this.translate.instant('target.chart.target'),
        value: this.goalTarget.targetMin ?? this.goalTarget.targetMax,
      });
    }
  }

  codesMatch(c1?: CodedValue, c2?: CodedValue): boolean {
    return c1?.code === c2?.code && c1?.system === c2?.system;
  }

  getUnitDisplay(): string {
    return this.translate.instant('patient.nutrition.' + this.unit);
  }

  getTargetDisplay(): string {
    if (this.goalTarget.targetMin === this.goalTarget.targetMax) {
      return `${this.goalTarget.targetMin}`;
    }
    return `${this.goalTarget.targetMin}-${this.goalTarget.targetMax}`;
  }

  getTargetDisplayWithUnit(): string {
    const targetValue = this.getTargetDisplay();
    const unitDisplay = this.getUnitDisplay();
    return `${targetValue} ${unitDisplay}`;
  }

  getAverageDisplayWithUnit(): string {
    return `${Math.round(this.average * 10) / 10} ${this.getUnitDisplay()}`;
  }

  // this forces the same color for all bars
  protected customColors = (seriesName: string) => {
    return CommonChartConf.areaColorScheme.domain[1];
  };
}
