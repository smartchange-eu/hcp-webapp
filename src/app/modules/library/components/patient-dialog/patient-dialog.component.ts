import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CodedValueConfig } from '@config/service/coded-values.config';
import {
  CareGiver,
  CodedValue,
  Gender,
  Patient,
  User,
} from '@eng-it4h/heart-ui-model';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';

@Component({
  selector: 'heart-patient-dialog',
  templateUrl: './patient-dialog.component.html',
  styleUrls: ['./patient-dialog.component.scss'],
})
export class PatientDialogComponent {
  patient: Patient;
  relationships: CodedValue[] = CodedValueConfig.familyMembersRelationships;
  genderValues: Gender[] = CodedValueConfig.genderValues;
  lang: string;
  @Output() save = new EventEmitter<Patient>();

  constructor(
    public dialogRef: MatDialogRef<PatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { lang: string; patient: Patient },
  ) {
    // Clone input array to avoid mutating the original
    this.patient = data.patient ?? new Patient();
    this.lang = data.lang;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  public async storeUser(
    evt: { user: User; familyMembers?: CareGiver[] } | User,
    goToDashboard: boolean,
  ): Promise<void> {
    let user: User;
    if (evt instanceof User) {
      user = evt;
    } else {
      user = evt.user;
    }
    this.save.emit(this.patient);
    this.dialogRef.close(this.patient);
  }
}
