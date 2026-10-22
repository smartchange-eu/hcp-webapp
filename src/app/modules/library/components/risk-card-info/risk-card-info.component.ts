import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '@eng-it4h/heart-ui-cdss';

@Component({
  selector: 'heart-prediction-card-info',
  templateUrl: './risk-card-info.component.html',
  styleUrls: ['./risk-card-info.component.scss'],
})
export class RiskCardInfoComponent {
  @Input() card!: Card;
  constructor() {}

  getStatusIcon(): string {
    switch (this.card.status) {
      case 'new':
        return 'auto_awesome';
      case 'hidden':
        return 'visibility_off';
      case 'accepting':
        return 'done';
      case 'accepted':
        return 'check_circle';
      case 'overridden':
        return 'cancel';
      case 'read':
        return 'beenhere';
      case 'stale':
        return 'disabled_by_default';
    }
  }
}
