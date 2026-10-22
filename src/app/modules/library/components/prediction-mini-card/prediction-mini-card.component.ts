import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action, Card, Suggestion } from '@eng-it4h/heart-ui-cdss';
import { Risk } from '@eng-it4h/heart-ui-model';
import { findOldestPrediction } from '@modules/service/services/oldest-prediction.function';

@Component({
  selector: 'heart-prediction-mini-card',
  templateUrl: './prediction-mini-card.component.html',
  styleUrls: ['./prediction-mini-card.component.scss'],
})
export class PredictionMiniCard {
  @Input() card!: Card; // the card coming from the XCDSS
  @Input() showVisibilityButton: boolean = true; // shows the button to show/hide the card [the EYE]
  @Input() showDetailsButton: boolean = true; // shows the button to show the details [the Open Detail button]
  @Input() showDate: boolean = false; // the card coming from the XCDSS
  @Output() manageSuggestions = new EventEmitter<Card>(); // emits when the button "show details" is clicked
  @Output() hideCard = new EventEmitter<{ card: Card; hidden: boolean }>(); // emits when the button "hide" is clicked

  @Input() wider: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  openCard(card: Card) {
    card.selected = true;
    this.manageSuggestions.emit(card);
  }

  toggleCardVisibility(card: Card) {
    card.status == 'hidden' ? (card.status = 'new') : (card.status = 'hidden');

    this.hideCard.emit({ card: card, hidden: card.status == 'hidden' });
  }

  getRisks(s: Suggestion): Risk[] {
    const risks =
      s.actions
        ?.filter((a: Action) => a.resource instanceof Risk)
        .map((a: Action) => a.resource as Risk) || [];
    return risks;
  }
  getPrediction(r: Risk): Risk.Prediction | undefined {
    return findOldestPrediction(r);
  }
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
