import { Patient, CodedValue, CareGiver, User } from '@eng-it4h/heart-ui-model';

export class TableEntry {
  user?: User;
  patient!: Patient;
  trialGroup!: CodedValue;
  familyMembers?: CareGiver[];
  dataVisible?: boolean;
}
