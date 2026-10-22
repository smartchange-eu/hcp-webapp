import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TeacherRoutingModule } from './teacher-routing.module';
import { ManageStudentsComponent } from './components/manage-students/manage-students.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { TeacherHealthHistoryComponent } from './components/teacher-health-history/teacher-health-history.component';

import { SharedModule } from '@modules/shared/shared.module';
import { LibraryModule } from '@modules/library/library.module';

import {
  PreventDoubleClickModule,
  MessageBoxModule,
} from '@eng-it4h/heart-ui-utils';

import {
  PatientAnagraphicFormModule,
  PatientListModule,
  PatientExpandibleModule,
} from '@eng-it4h/heart-ui-patient';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';

import {
  QuantitativeLinechartModule,
  QuantitativeBarchartModule,
} from '@eng-it4h/heart-ui-measure';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ManageStudentsComponent,
    AddPatientComponent,
    TeacherHealthHistoryComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    LibraryModule,
    TranslateModule.forChild(),
    TeacherRoutingModule,
    PatientAnagraphicFormModule,
    PatientListModule,
    PatientExpandibleModule,
    PreventDoubleClickModule,
    MessageBoxModule,
    QuantitativeBarchartModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatDividerModule,
    MatSidenavModule,
    MatExpansionModule,
    QuantitativeLinechartModule,
  ],
})
export class TeacherModule {}
