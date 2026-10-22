import { Component, Input, OnInit } from '@angular/core';
import { Risk, RiskLevel } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-risk-level-card',
  templateUrl: './risk-level-card.component.html',
  styleUrls: ['./risk-level-card.component.scss'],
})
export class RiskLevelCardComponent implements OnInit {
  @Input() risk!: Risk.Prediction;

  customColors: any;
  public data: {name: string, value: number}[] = [];

  ngOnInit(): void {
    this.data.push({ name: 'Risk', value: this.risk.probability * 100 });
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
}
