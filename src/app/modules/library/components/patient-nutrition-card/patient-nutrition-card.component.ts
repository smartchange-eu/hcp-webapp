import { Component, OnInit, Input } from '@angular/core';
import { CodedValue, Nutrition, NutritionItem } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-patient-nutrition-card',
  templateUrl: './patient-nutrition-card.component.html',
  styleUrls: ['./patient-nutrition-card.component.scss'],
})
export class PatientNutritionCardComponent implements OnInit {
  @Input() measures?: Nutrition;

  ngOnInit(): void {}
}
