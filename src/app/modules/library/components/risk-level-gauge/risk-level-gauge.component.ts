import { Component, Input, OnInit } from '@angular/core';
import { Risk, RiskLevel } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-risk-level-gauge',
  templateUrl: './risk-level-gauge.component.html',
  styleUrls: ['./risk-level-gauge.component.scss'],
})
export class RiskLevelGaugeComponent implements OnInit {
  @Input() risk!: Risk.Prediction;
  @Input() showUncertainty = false;

  customColors: any;
  public data: { name: string; value: number }[] = [];

  ngOnInit(): void {
    this.data.push({ name: 'Risk', value: this.risk.probability * 100 });
    // if (this.showUncertainty) {
    //   this.data.push({ name: 'min', value: this.risk.range.min * 100 });
    //   this.data.push({ name: 'max', value: this.risk.range.max * 100 });
    // }
    let color = '#FF5A33';
    if (this.risk.level === RiskLevel.LOW) {
      color = '#44803F';
    } else if (this.risk.level === RiskLevel.MODERATE) {
      color = '#FFEC5C';
    }
    this.customColors = [
      {
        name: 'Risk',
        value: color,
      },
    ];
  }

  get percent(): number {
    return Math.round(this.risk.probability * 1000) / 10;
  }

  get range(): string {
    if (this.risk.range.min != this.risk.range.max)
      return (
        Math.round(this.risk.range.min * 1000) / 10 +
        ' - ' +
        Math.round(this.risk.range.max * 1000) / 10
      );
    return this.percent + '';
  }
}
