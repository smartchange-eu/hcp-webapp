import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Goal } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-goals-dialog',
  templateUrl: './goal-selection.dialog.html',
  styleUrls: ['./goal-selection.dialog.scss'],
})
export class GoalSelectionDialogComponent {
  selectedGoal?: Goal;
  allGoals: Goal[] = [];

  constructor(
    public dialogRef: MatDialogRef<GoalSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { goals: Goal[] }
  ) {
    this.allGoals = [...data.goals];
  }

  selectGoal(): void {
    this.dialogRef.close(this.selectedGoal);
  }

  public getVariableName(goal: Goal): string {
    return goal.type.uniqueLabelKey;
  }
}
