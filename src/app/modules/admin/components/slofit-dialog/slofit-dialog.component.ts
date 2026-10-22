import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidationConfig } from '@eng-it4h/heart-ui-utils';
import {
  CareGiver,
  CodedValue,
  Gender,
  Patient,
} from '@eng-it4h/heart-ui-model';
export type FormResult = {
  email?: string;
  parent_name?: string;
  dob?: Date;
  kidName?: string;
};
@Component({
  selector: 'heart-slofit-dialog',
  templateUrl: './slofit-dialog.component.html',
  styleUrls: ['./slofit-dialog.component.scss'],
})
export class SlofitDialogComponent {
  public form: FormGroup;
  protected family: CareGiver[] = [];
  lang: string;
  @Output() save = new EventEmitter<FormResult>();
  selectedFamilyIndex: number = 0;
  protected emailValidationPattern: string =
    ValidationConfig.emailValidationPattern;

  constructor(
    public dialogRef: MatDialogRef<SlofitDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { lang: string; familyMembers: CareGiver[]; p: Patient },
  ) {
    this.lang = data.lang;
    this.form = new FormGroup({});
    this.family = data.familyMembers ?? [];
    const fm = this.family?.at(0);
    const name = fm ? fm.firstName + ' ' + fm.lastName : undefined;
    this.form.addControl(
      'email',
      new FormControl(fm?.email, Validators.required),
    );
    this.form
      .get('email')
      ?.addValidators(Validators.pattern(this.emailValidationPattern));

    this.form.addControl('name', new FormControl(name, Validators.required));
    this.form.addControl(
      'kid',
      new FormControl(data.p?.getFullName(), Validators.required),
    );
    this.form.addControl('birthDay', new FormControl(undefined));
  }

  onFamilySelect(index: number): void {
    this.selectedFamilyIndex = index;
    const fm = this.family?.at(index);
    const name = fm ? fm.firstName + ' ' + fm.lastName : '';
    this.form.patchValue({
      email: fm?.email || '',
      name: name,
    });
  }

  onSave(): void {
    const ret: FormResult = {
      dob: this.form.get('birthDay')?.value,
      kidName: this.form.get('kid')?.value,
      email: this.form.get('email')?.value,
      parent_name: this.form.get('name')?.value,
    };

    this.save.emit(ret);
    this.dialogRef.close(ret);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(formControlName: string): string {
    if (this.form.contains(formControlName)) {
      const control = this.form.get(formControlName);
      if (control?.hasError('required')) {
        return 'family-member.required.error';
      }
      if (control?.hasError('pattern')) {
        if (formControlName == 'email') {
          return 'family-member.email.pattern.error';
        }
      }
    }
    return '';
  }
}
