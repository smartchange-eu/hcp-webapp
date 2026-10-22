import { Component, Input } from '@angular/core';
import { Risk, RiskLevel } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-initial-risk-card',
  templateUrl: './initial-risk-card.component.html',
  styleUrls: ['./initial-risk-card.component.scss'],
})
export class InitialRiskCardComponent {
  @Input() risk!: Risk;

  getGaugeData(prediction: Risk.Prediction) {
    const value = this.getGaugeValue(prediction.level);
    const name = prediction.code?.display || 'Risk';

    return {
      results: [{ name, value }],
      customColors: [
        {
          name,
          value: this.getColorForValue(value),
        },
      ],
    };
  }

  getColorForValue(value: number): string {
    if (value < 40) return 'green';
    if (value < 75) return 'orange';
    return 'red';
  }

  getRiskClass(level: RiskLevel): string {
    switch (level) {
      case RiskLevel.LOW:
        return 'low';
      case RiskLevel.MODERATE:
        return 'moderate';
      case RiskLevel.HIGH:
        return 'high';
      default:
        return '';
    }
  }

  customColor = (value: any, v: any): string => {
    if (value.value < 40) {
      return 'green';
    } else if (value.value < 75) {
      return 'orange';
    } else {
      return 'red';
    }
  };

  getGaugeValue(level: RiskLevel): number {
    switch (level) {
      case RiskLevel.LOW:
        return 15;
      case RiskLevel.MODERATE:
        return 50;
      case RiskLevel.HIGH:
        return 100;
      default:
        return 0;
    }
  }
}
