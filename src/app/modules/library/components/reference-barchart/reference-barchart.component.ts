import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  BaseChartComponent,
  calculateViewDimensions,
  ColorHelper,
  DataItem,
  LegendOptions,
  LegendPosition,
  ScaleType,
  ViewDimensions,
} from '@swimlane/ngx-charts';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

@Component({
  selector: 'heart-reference-barchart',
  templateUrl: './reference-barchart.component.html',
  styleUrls: ['./reference-barchart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ReferenceBarChartComponent extends BaseChartComponent {
  @Input() legend = false;
  @Input() legendTitle: string = 'Legend';
  @Input() legendPosition: LegendPosition = LegendPosition.Right;
  @Input() xAxis = true;
  @Input() yAxis = true;
  @Input() showXAxisLabel: boolean = false;
  @Input() showYAxisLabel: boolean = false;
  @Input() xAxisLabel: string = '';
  @Input() yAxisLabel: string = '';
  @Input() tooltipDisabled: boolean = false;
  @Input() gradient: boolean = false;
  @Input() showGridLines: boolean = true;
  @Input() activeEntries: any[] = [];
  @Input() override schemeType!: ScaleType;
  @Input() trimXAxisTicks: boolean = true;
  @Input() trimYAxisTicks: boolean = true;
  @Input() rotateXAxisTicks: boolean = true;
  @Input() maxXAxisTickLength: number = 16;
  @Input() maxYAxisTickLength: number = 16;
  @Input() xAxisTickFormatting: any;
  @Input() yAxisTickFormatting: any;
  @Input() xAxisTicks!: any[];
  @Input() yAxisTicks!: any[];
  @Input() barPadding = 8;
  @Input() roundDomains: boolean = false;
  @Input() roundEdges: boolean = true;
  @Input() yScaleMax?: number;
  @Input() yScaleMin?: number;
  @Input() showDataLabel: boolean = false;
  @Input() dataLabelFormatting: any;
  @Input() noBarWhenZero: boolean = false;

  @Input() referenceLines: { value: number; name: string; color?: string }[] =
    [];
  @Input() showRefLines: boolean = false;
  @Input() showRefLabels: boolean = false;

  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate!: TemplateRef<any>;

  dims!: ViewDimensions;
  xScale: any;
  yScale: any;
  xDomain: any;
  yDomain: any;
  transform?: string;
  colors!: ColorHelper;
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions!: LegendOptions;
  dataLabelMaxHeight: any = { negative: 0, positive: 0 };

  override update(): void {
    super.update();

    if (!this.showDataLabel) {
      this.dataLabelMaxHeight = { negative: 0, positive: 0 };
    }
    this.margin = [
      10 + this.dataLabelMaxHeight.positive,
      20,
      10 + this.dataLabelMaxHeight.negative,
      20,
    ];

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
      showLegend: this.legend,
      legendType: this.schemeType,
      legendPosition: this.legendPosition,
    });

    this.formatDates();

    if (this.showDataLabel) {
      this.dims.height -= this.dataLabelMaxHeight.negative;
    }
    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${
      this.margin[0] + this.dataLabelMaxHeight.negative
    })`;

    if (this.showRefLines) {
      const parent = select(this.chartElement.nativeElement)
        .select('.bar-chart')
        .node() as HTMLElement;
      const refLines = select(this.chartElement.nativeElement)
        .selectAll('.ref-line')
        .nodes() as HTMLElement[];
      refLines.forEach((line) => parent.appendChild(line));
    }
  }

  getXScale(): any {
    this.xDomain = this.getXDomain();
    const spacing =
      this.xDomain.length / (this.dims.width / this.barPadding + 1);
    return scaleBand()
      .range([0, this.dims.width])
      .paddingInner(spacing)
      .domain(this.xDomain);
  }

  getYScale(): any {
    this.yDomain = this.getYDomain();
    const scale = scaleLinear()
      .range([this.dims.height, 0])
      .domain(this.yDomain);
    return this.roundDomains ? scale.nice() : scale;
  }

  getXDomain(): any[] {
    return this.results.map((d: any) => d.label);
  }

  getYDomain(): [number, number] {
    const values = this.results.map((d: any) => d.value);

    let min = this.yScaleMin
      ? Math.min(this.yScaleMin, ...values)
      : Math.min(0, ...values);
    if (this.yAxisTicks && !this.yAxisTicks.some(isNaN)) {
      min = Math.min(min, ...this.yAxisTicks);
    }
    values.push(...this.referenceLines.map((r) => r.value));
    let max = this.yScaleMax
      ? Math.max(this.yScaleMax, ...values)
      : Math.max(0, ...values);
    if (this.yAxisTicks && !this.yAxisTicks.some(isNaN)) {
      max = Math.max(max, ...this.yAxisTicks);
    }
    return [min, max + 0.05 * max];
  }

  onClick(data: DataItem | string) {
    this.select.emit(data);
  }

  setColors(): void {
    let domain;
    if (this.schemeType === ScaleType.Ordinal) {
      domain = this.xDomain;
    } else {
      domain = this.yDomain;
    }

    this.colors = new ColorHelper(
      this.scheme,
      this.schemeType,
      domain,
      this.customColors
    );
  }

  getLegendOptions() {
    const opts: LegendOptions = {
      scaleType: this.schemeType as any,
      colors: undefined as ColorHelper | undefined,
      domain: [],
      title: '',
      position: this.legendPosition,
    };
    if (opts.scaleType === ScaleType.Ordinal) {
      opts.domain = this.xDomain;
      opts.colors = this.colors;
      opts.title = this.legendTitle;
    } else {
      opts.domain = this.yDomain;
      opts.colors = this.colors?.scale;
    }
    return opts;
  }

  updateYAxisWidth({ width }: { width: number }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }: { height: number }): void {
    this.xAxisHeight = height;
    this.update();
  }

  onDataLabelMaxHeightChanged(event: any) {
    if (event.size.negative) {
      this.dataLabelMaxHeight.negative = Math.max(
        this.dataLabelMaxHeight.negative,
        event.size.height
      );
    } else {
      this.dataLabelMaxHeight.positive = Math.max(
        this.dataLabelMaxHeight.positive,
        event.size.height
      );
    }
    if (event.index === this.results.length - 1) {
      setTimeout(() => this.update());
    }
  }

  onActivate(item: any, fromLegend = false) {
    item = this.results.find((d: any) => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = this.activeEntries.findIndex((d) => {
      return (
        d.name === item.name &&
        d.value === item.value &&
        d.series === item.series
      );
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [item, ...this.activeEntries];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item: any, fromLegend = false) {
    item = this.results.find((d: any) => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = this.activeEntries.findIndex((d) => {
      return (
        d.name === item.name &&
        d.value === item.value &&
        d.series === item.series
      );
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }
}
