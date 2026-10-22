import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { LegendPosition } from '@swimlane/ngx-charts';
import { max } from 'd3-array';
import { scaleBand, scaleLinear } from 'd3-scale';
import { curveLinear } from 'd3-shape';

interface ChartDims {
  width: number;
  height: number;
}

interface LineChartSeries {
  name: string;
  series: { name: string; value: number }[];
}

@Component({
  selector: 'combo-chart-component',
  templateUrl: './combo-chart.component.html',
  styleUrls: ['./combo-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboChartComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() lineChart: LineChartSeries[] = [];

  @Input() view: [number, number] = [700, 400];
  @Input() legend = false;
  @Input() legendTitle = '';
  @Input() legendPosition: LegendPosition = LegendPosition.Right;
  @Input() xAxis = true;
  @Input() yAxis = true;
  @Input() showXAxisLabel = false;
  @Input() showYAxisLabel = false;
  @Input() showRightYAxisLabel = false;
  @Input() xAxisLabel = '';
  @Input() yAxisLabel = '';

  @Input() animations = true;
  @Input() gradient = false;
  @Input() showGridLines = true;
  @Input() scheme: any = { domain: ['#3f51b5'] }; // bars
  @Input() colorSchemeLine: any = { domain: ['#e91e63', '#4caf50'] }; // lines
  @Input() curve: any = curveLinear;
  @Input() autoScale = true;
  @Input() noBarWhenZero = false;
  @Input() tooltipDisabled = false;

  @Output() select = new EventEmitter<any>();
  @Output() activate = new EventEmitter<any>();
  @Output() deactivate = new EventEmitter<any>();

  xScale: any;
  yScale: any;
  dims: ChartDims = { width: 0, height: 0 };

  ngOnInit(): void {
    this.calculateScales();
  }

  private calculateScales(): void {
    const margin = { top: 10, right: 20, bottom: 60, left: 60 };
    this.dims = {
      width: this.view[0] - margin.left - margin.right,
      height: this.view[1] - margin.top - margin.bottom,
    };

    const xDomain = this.results.map((d) => d.name);
    this.xScale = scaleBand()
      .domain(xDomain)
      .range([0, this.dims.width])
      .padding(0.2);

    const barMax = max(this.results, (d: any) => +d.value) || 0;
    const lineMax =
      this.lineChart.length > 0
        ? max(
            this.lineChart.flatMap((series) => series.series),
            (d: any) => +d.value
          ) || 0
        : 0;
    const yMax = Math.max(barMax, lineMax);

    this.yScale = scaleLinear().domain([0, yMax]).range([this.dims.height, 0]);
  }

  trackBy = (_: any, i: number) => i;

  getLinePath(series: any[]): string {
    if (!series || series.length === 0) return '';

    return series
      .map((point: any, index: number) => {
        const x = this.xScale(point.name) + this.xScale.bandwidth() / 2;
        const y = this.yScale(point.value);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  getLegendTransform(): string {
    if (this.legendPosition === LegendPosition.Right) {
      return `translate(${this.view[0] - 150}, 30)`;
    }
    return `translate(60, ${this.view[1] - 100})`;
  }

  shouldShowDateLabel(index: number): boolean {
    const totalItems = this.results.length;
    if (totalItems <= 7) return true;
    if (totalItems <= 14) return index % 2 === 0;
    if (totalItems <= 21) return index % 3 === 0;
    return index % 4 === 0;
  }
}
