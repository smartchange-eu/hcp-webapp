import { Component, Input, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'heart-colored-gauge',
  templateUrl: './colored-gauge.component.html',
  styleUrls: ['./colored-gauge.component.scss'],
})
export class ColoredGaugeComponent implements OnInit {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() colorBreakpoints: Array<{ value: number; color: string }> = [
    { value: 0, color: '#ff3b1f' },
    { value: 30, color: '#ff9f1c' },
    { value: 70, color: '#ffe066' },
    { value: 100, color: '#2ecc71' },
  ];
  @Input() showValues: boolean = true;
  indicatorPosition = 0;

  segments: Array<{ widthPct: number; color: string; value: number }> = [];

  ngOnInit(): void {
    this.computeSegments();
    this.computeIndicatorPosition();
  }

  private computeSegments(): void {
    const sorted = [...this.colorBreakpoints].sort((a, b) => a.value - b.value);
    const computedSegments: Array<{
      widthPct: number;
      color: string;
      value: number;
    }> = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const start = sorted[i].value;
      const end = sorted[i + 1].value;

      const range = this.max - this.min;
      const segmentRange = end - start;

      const widthPct = (segmentRange / range) * 100;

      computedSegments.push({
        widthPct,
        color: sorted[i].color,
        value: sorted[i + 1].value,
      });
    }

    this.segments = computedSegments;
  }

  private computeIndicatorPosition(): void {
    const clamped = Math.min(Math.max(this.value, this.min), this.max);
    const range = this.max - this.min;
    this.indicatorPosition = ((clamped - this.min) / range) * 100;
  }
}
