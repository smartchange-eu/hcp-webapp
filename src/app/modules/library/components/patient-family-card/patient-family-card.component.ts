import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CareGiver, Patient } from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-patient-family-card',
  templateUrl: './patient-family-card.component.html',
  styleUrls: ['./patient-family-card.component.scss'],
})
export class PatientFamilyCardComponent {
  @Input() public selectedPatient?: Patient;

  @Input() public selectedFamily?: CareGiver[];
  @Input() public showOrg = false;
  @Input() public canRemoveFM = false;
  @Output() public removeFM: EventEmitter<CareGiver> =
    new EventEmitter<CareGiver>();
  protected getAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  doDelete(fm: CareGiver) {
    this.removeFM.emit(fm);
  }
}
