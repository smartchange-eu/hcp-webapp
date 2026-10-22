import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CodedValue,
  Encounter,
  EncounterType,
  Organization,
} from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-new-encounter-dialog',
  templateUrl: './new-encounter-dialog.component.html',
  styleUrls: ['./new-encounter-dialog.component.scss'],
})
export class NewEncounterDialogComponent implements OnInit {
  protected PREFIX = 'new-encounter-dialog.type.label.';

  public title: string;
  public msg: string;
  public closeLabel: string;
  public okLabel: string;

  protected types: CodedValue[] = [];
  protected orgsValues: Organization[] = [];
  public selectedType?: CodedValue;
  public selectedOrg?: Organization;

  public constructor(
    public dialogRef: MatDialogRef<NewEncounterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.msg = data.msg;
    this.closeLabel = data.closeLabel;
    this.okLabel = data.okLabel;
    this.orgsValues = data.orgs;
    this.types = data.types;

    this.createOptions();
  }

  public ngOnInit(): void {}

  protected save(): void {
    if (this.selectedType) {
      const ep = new Encounter();
      ep.type = EncounterType.convertFromString(this.selectedType.code);
      ep.serviceProvider = this.selectedOrg;

      this.dialogRef.close(ep);
    } else {
      // do nothing
    }
  }

  protected close(): void {
    this.dialogRef.close();
  }

  private createOptions(): void {
    if (this.types?.length == 1) {
      this.selectedType = this.types[0];
    }
    if (this.orgsValues?.length == 1) {
      this.selectedOrg = this.orgsValues[0];
    }
  }
}
