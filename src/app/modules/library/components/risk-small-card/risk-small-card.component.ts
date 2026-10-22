import { Component, Input, OnInit } from '@angular/core';
import { Risk } from '@eng-it4h/heart-ui-model';
import { findOldestPrediction } from '@modules/service/services/oldest-prediction.function';

@Component({
  selector: 'heart-risk-small-card',
  templateUrl: './risk-small-card.component.html',
  styleUrls: ['./risk-small-card.component.scss'],
})
export class RiskSmallCardComponent implements OnInit {
  @Input() risk?: Risk;
  @Input() prediction?: Risk.Prediction;
  @Input() showDetails?: boolean = true;

  protected oldestPrediction = findOldestPrediction;
  protected loading: boolean = true;

  ngOnInit() {
    this.loading = true;
    if (this.risk && !this.prediction) {
      this.prediction = this.oldestPrediction(this.risk);
    }
    this.loading = false;
  }
}
