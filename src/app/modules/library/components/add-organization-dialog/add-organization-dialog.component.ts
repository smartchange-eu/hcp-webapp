import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'heart-add-organization-dialog',
  templateUrl: './add-organization-dialog.component.html',
  styleUrls: ['./add-organization-dialog.component.scss'],
})
export class AddOrganizationDialogComponent {
  organizationName: string;

  constructor(
    public dialogRef: MatDialogRef<AddOrganizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {
    this.organizationName = data.name || '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    if (this.organizationName.trim()) {
      this.dialogRef.close(this.organizationName.trim());
    }
  }
}
