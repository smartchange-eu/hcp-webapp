import { Component, Input, OnInit } from '@angular/core';
import {
  CodedValue,
  GenericQuantitativeMeasure,
  QuantitativeMeasure,
} from '@eng-it4h/heart-ui-model';
import { TranslateService } from '@ngx-translate/core';
import { curveCardinal } from 'd3-shape';
import { ChartTarget } from '../chart.target.model';

@Component({
  selector: 'target-card-linechart',
  templateUrl: './target-card-linechart.component.html',
  styleUrls: ['./target-card-linechart.component.scss'],
})
export class TargetCardLinechartComponent implements OnInit {
  @Input() goalTarget!: ChartTarget;
  @Input() measures!: QuantitativeMeasure[];
  unit: string = 'units';

  chartData: any[] = [];
  referenceLines: any[] = [];
  average = 0;
  curve = curveCardinal;

  colorScheme = {
    domain: ['#5a67d8', '#48bb78', '#ed8936', '#9f7aea'],
  };
  constructor(private translate: TranslateService) {}
  ngOnInit(): void {
    this.processData();
    this.getUnitForTarget();
    this.setupReferenceLines();
  }

  private processData(): void {
    this.chartData = [
      {
        name: this.getDisplayName(this.goalTarget.code),
        series: this.measures.map((m) => ({
          name: m.assertedWhen,
          value: m.value,
        })),
      },
    ];

    const total = this.measures.reduce((acc, m) => acc + (m.value ?? 0), 0);
    this.average = this.measures.length ? total / this.measures.length : 0;
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

  private setupReferenceLines(): void {
    this.referenceLines = [
      {
        name: 'Target Min',
        value: this.goalTarget.targetMin,
      },
      {
        name: 'Target Max',
        value: this.goalTarget.targetMax,
      },
    ];
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  }

  getMinValue(): number {
    const dataMin = Math.min(...this.measures.map((m) => m.value ?? 0));
    const targetMin = this.goalTarget.targetMin ?? 0;
    return Math.floor(Math.min(dataMin, targetMin) * 0.9);
  }

  getMaxValue(): number {
    const dataMax = Math.max(...this.measures.map((m) => m.value ?? 0));
    const targetMax = this.goalTarget.targetMax ?? 0;
    return Math.ceil(Math.max(dataMax, targetMax) * 1.1);
  }

  getDisplayName(code: CodedValue): string {
    return code.uniqueLabelKey ?? 'Unknown';
  }

  getUnitDisplay(): string {
    return this.translate.instant(this.unit);
  }

  getYAxisLabel(): string {
    return `${this.getDisplayName(
      this.goalTarget.code
    )} (${this.getUnitDisplay()})`;
  }
}
