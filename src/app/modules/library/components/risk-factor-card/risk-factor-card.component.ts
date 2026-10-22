import { Component, Input, OnInit } from '@angular/core';
import { PatientCard } from '@eng-it4h/heart-ui-cdss';

@Component({
  selector: 'heart-risk-factor-card',
  templateUrl: './risk-factor-card.component.html',
  styleUrls: ['./risk-factor-card.component.scss'],
})
export class RiskFactorCardComponent implements OnInit {
  @Input() base?: PatientCard;
  @Input() card!: PatientCard;
  @Input() label?: string;
  @Input() showRisk: boolean = false;
  @Input() riskPlaceholder: boolean = false;
  @Input() colorMap: Map<string, string> = new Map<string, string>();
  @Input() maxDecimals: number = 3;
  @Input() useArrows = false;
  @Input() showTooltip = true;

  baseValues: Map<string, any> = new Map<string, any>();

  constructor() {}

  ngOnInit(): void {
    if (this.base?.features) {
      this.base.features.forEach((f) => {
        if (typeof f.value == 'number') {
          this.baseValues.set(f.key.uniqueLabelKey, Math.round(f.value * 100) / 100);
        } else this.baseValues.set(f.key.uniqueLabelKey, f.value);
      });
    }
  }
}
