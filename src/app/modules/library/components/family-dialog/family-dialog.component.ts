import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { CareGiver, CodedValue, Gender } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-family-dialog',
  templateUrl: './family-dialog.component.html',
  styleUrls: ['./family-dialog.component.scss'],
})
export class FamilyDialogComponent {
  familyMember: CareGiver;
  relationships: CodedValue[] = CodedValueConfig.familyMembersRelationships;
  genderValues: Gender[] = CodedValueConfig.genderValues;
  lang: string;
  @Output() save = new EventEmitter<CareGiver>();

  constructor(
    public dialogRef: MatDialogRef<FamilyDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { lang: string; familyMember: CareGiver }
  ) {
    // Clone input array to avoid mutating the original
    this.familyMember = data.familyMember ?? new CareGiver();
    this.lang = data.lang;
  }

  onSave(): void {
    this.save.emit(this.familyMember);
    this.dialogRef.close(this.familyMember);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
