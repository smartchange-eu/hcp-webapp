import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { scaleLinear } from 'd3-scale';

import { BaseChartComponent } from '@swimlane/ngx-charts';
import { calculateViewDimensions } from '@swimlane/ngx-charts';
import { ColorHelper } from '@swimlane/ngx-charts';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ViewDimensions, BarOrientation, ScaleType } from '@swimlane/ngx-charts';
import { VERDANA_FONT_WIDTHS_16_PX } from './assets/font-width';
import { CodedValue } from '@eng-it4h/heart-ui-model';
import { ModelFeature } from '@eng-it4h/heart-ui-cdss';

enum ElementType {
  Value = 'value',
  Units = 'units',
}

@Component({
  selector: 'heart-risk-gauge',
  templateUrl: './risk-gauge.component.html',
  styleUrls: ['./assets/base-chart.component.scss', './risk-gauge.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskGaugeComponent extends BaseChartComponent implements AfterViewInit, OnInit {
  @Input() feature?: ModelFeature;
  @Input() baseValue?: any;

  @Input() defaultValue?: number;
  @Input() defaultUnits?: string;
  @Input() defaultLabel?: string;
  @Input() defaultMin?: number;
  @Input() defaultMax?: number;
  @Input() maxDecimals: number = 3;
  @Input() useArrows = false;
  @Input() hideTooltip: boolean = false;

  @ViewChild('valueTextEl') valueTextEl?: ElementRef;
  @ViewChild('unitsTextEl') unitsTextEl?: ElementRef;

  @Input() color?: string;
  value: number = 0;
  units: string = '';
  label: string = '';
  previousValue: number = 0;
  min: number = 0;
  max: number = 100;
  dims!: ViewDimensions;
  valueDomain!: [number, number];
  valueScale: any;

  colors?: ColorHelper;
  transform?: string;
  margin: number[] = [10, 20, 10, 20];
  transformLine?: string;

  valueResizeScale: number = 1;
  unitsResizeScale: number = 1;
  valueTextTransform: string = '';
  valueTranslate: string = '';
  unitsTextTransform: string = '';
  unitsTranslate: string = '';
  displayValue: string = '';

  // specific to counterfactual.
  // TODO: need some cleaning when it works properly
  hasProjectedValue: boolean = false;
  projXoffest: number = 0;
  transformBar: string = '';
  barOrientation = BarOrientation;
  barValue: number = 0;

  override ngOnInit(): void {
    if (this.feature && this.feature?.valueType === 'number') {
      this.value = (this.feature.value as number) ?? this.value;
      this.units = this.feature.unit ?? this.units;
      this.label = this.getInLabel(this.feature.key) ?? this.label;
    }
    if (this.baseValue) {
      this.hasProjectedValue = true;
      this.previousValue = this.baseValue as number;
    }
    this.value = this.defaultValue || this.value;
    this.label = this.defaultLabel || this.label;
    this.units = this.defaultUnits || this.units;
    this.barValue = this.hasProjectedValue ? Math.abs(this.value - this.previousValue) : 0;
  }

  getInLabel(codedV: CodedValue): string {
    return codedV?.system?.length > 0 ? codedV?.uniqueLabelKey : codedV?.code;
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    setTimeout(() => {
      this.scaleText(ElementType.Value);
      this.scaleText(ElementType.Units);
    });
  }

  updateMin(): number {
    if (this.value === undefined || this.value - this.previousValue === 0) return 0;
    const m = this.previousValue - Math.abs((this.previousValue - this.value) * 3);
    return m > 0 ? m : 0;
  }

  updateMax(): number {
    return this.previousValue + Math.abs(this.previousValue - this.min);
  }

  override update(): void {
    super.update();

    this.min = this.updateMin();
    this.max = this.updateMax();

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
    });

    this.valueDomain = this.getValueDomain();
    this.valueScale = this.getValueScale();
    this.displayValue = this.getDisplayValue();

    this.setColors();

    const xOffset = this.margin[3] + this.dims.width / 2;
    const yOffset = this.margin[0] + this.dims.height / 2;

    this.transform = `translate(${xOffset}, ${yOffset})`;
    this.transformLine = `translate(${this.margin[3] + this.valueScale(this.previousValue)}, ${yOffset})`;

    this.projXoffest = this.getBarXOffset();
    this.transformBar = this.hasProjectedValue ? `translate(${this.valueScale(this.projXoffest)}, 0)` : '';

    this.valueTranslate = `translate(0, -15)`;
    this.unitsTranslate = `translate(0, 15)`;

    if (isPlatformServer(this.platformId)) {
      this.scaleTextSSR('value');
      this.scaleTextSSR('units');
    } else {
      setTimeout(() => this.scaleText(ElementType.Value), 50);
      setTimeout(() => this.scaleText(ElementType.Units), 50);
    }
  }

  getValueDomain(): [number, number] {
    return [this.min, this.max];
  }

  getValueScale(): any {
    return scaleLinear().range([0, this.dims.width]).domain(this.valueDomain);
  }

  getDisplayValue(): string {
    return this.formatLabel();
  }

  formatLabel(): string {
    if (this.useArrows) return this.hasProjectedValue ? `${this.roundDecimals(this.previousValue)} → ${this.roundDecimals(this.value)}` : `${this.roundDecimals(this.value)}`;
    else return this.hasProjectedValue ? `${this.roundDecimals(this.value)} (${this.roundDecimals(this.previousValue)})` : `${this.roundDecimals(this.value)}`;
  }

  getTooltipKey(codedV: CodedValue): string {
    const label = codedV?.system?.length > 0 ? codedV?.uniqueLabelKey : codedV?.code;
    return 'tooltip.risk-factor.' + label;
  }

  roundDecimals(v: number): number {
    const factor = Math.pow(10, this.maxDecimals);
    return Math.round(v * factor) / factor;
  }

  getBarXOffset(): number {
    return this.value < this.previousValue ? this.value : this.previousValue;
  }

  scaleText(element: ElementType, repeat: boolean = true): void {
    let el;
    let resizeScale;
    if (element === ElementType.Value) {
      el = this.valueTextEl;
      resizeScale = this.valueResizeScale;
    } else {
      el = this.unitsTextEl;
      resizeScale = this.unitsResizeScale;
    }

    const { width, height } = el?.nativeElement.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const oldScale = resizeScale;
    const availableWidth = this.dims.width;
    const availableHeight = Math.max(this.dims.height / 2 - 15, 0);
    const resizeScaleWidth = Math.floor((availableWidth / (width / resizeScale)) * 100) / 100;
    const resizeScaleHeight = Math.floor((availableHeight / (height / resizeScale)) * 100) / 100;
    resizeScale = Math.min(resizeScaleHeight, resizeScaleWidth);

    if (resizeScale !== oldScale) {
      if (element === ElementType.Value) {
        this.valueResizeScale = resizeScale;
        this.valueTextTransform = `scale(${resizeScale}, ${resizeScale})`;
      } else {
        this.unitsResizeScale = resizeScale;
        this.unitsTextTransform = `scale(${resizeScale}, ${resizeScale})`;
      }
      this.cd.markForCheck();
      if (repeat && isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          this.scaleText(element, false);
        }, 50);
      }
    }
  }

  calculateTextWidth(fontFamilyKey: Record<string, any>, text: string, defaultWidth = 8) {
    return text.split('').reduce((acc, curr) => {
      const width = fontFamilyKey[curr] || defaultWidth;
      return acc + width;
    }, 0);
  }

  scaleTextSSR(element: string) {
    let resizeScale = 1;

    const value = element === 'value' ? this.displayValue : this.units;
    const width = this.calculateTextWidth(VERDANA_FONT_WIDTHS_16_PX, value, 10);
    const height = 25;

    const availableWidth = this.dims.width;
    const availableHeight = Math.max(this.dims.height / 2 - 15, 0);
    const resizeScaleWidth = Math.floor((availableWidth / (width / resizeScale)) * 100) / 100;
    const resizeScaleHeight = Math.floor((availableHeight / (height / resizeScale)) * 100) / 100;
    resizeScale = Math.min(resizeScaleHeight, resizeScaleWidth);

    if (element === 'value') {
      this.valueResizeScale = resizeScale;
      this.valueTextTransform = `scale(${resizeScale}, ${resizeScale})`;
    } else {
      this.unitsResizeScale = resizeScale;
      this.unitsTextTransform = `scale(${resizeScale}, ${resizeScale})`;
    }

    this.cd.markForCheck();
  }

  onClick(): void {
    this.select.emit({
      name: 'Value',
      value: this.value,
    });
  }

  setColors(): void {
    this.colors = new ColorHelper(this.scheme, ScaleType.Ordinal, [this.value], this.customColors);
  }

  public override customColors = (statName: string) => {
    return this.color ?? '#1A0C42';
  };
}
