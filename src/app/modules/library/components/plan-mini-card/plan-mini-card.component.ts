import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Plan } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-plan-mini-card',
  templateUrl: './plan-mini-card.component.html',
  styleUrls: ['./plan-mini-card.component.scss'],
})
export class PlanMiniCardComponent {
  @Input() plan?: Plan;
  @Input() buttonText?: string;
  @Input() buttonIcon?: string;
  @Output() public clicked = new EventEmitter<boolean>();
  get focus(): string {
    return this.plan?.category.uniqueLabelKey || '-';
  }

  buttonClicked(): void {
    this.clicked.emit(true);
  }
}
