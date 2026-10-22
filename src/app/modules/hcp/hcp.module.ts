import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

import {
  MessageBoxModule,
  PreventDoubleClickModule,
} from '@eng-it4h/heart-ui-utils';

import {
  PatientAnagraphicFormModule,
  AddressFormModule,
  PatientExpandibleModule,
  PatientListModule,
} from '@eng-it4h/heart-ui-patient';

import { TranslateModule } from '@ngx-translate/core';

import { HcpRoutingModule } from './hcp-routing.module';
import { HcpHomeComponent } from './components/hcp-home/hcp-home.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { MatIconModule } from '@angular/material/icon';

import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import {
  AppointmentsBrowserModule,
  HeartAppointmentFormModule,
} from '@eng-it4h/heart-ui-encounter';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RedirectHomeRouteGuard } from './redirect-home-route.guard';
import { SharedModule } from '@modules/shared/shared.module';
import { LibraryModule } from '@modules/library/library.module';

@NgModule({
  declarations: [HcpHomeComponent, AddPatientComponent, AppointmentsComponent],
  imports: [
    SharedModule,
    TranslateModule.forChild(),
    MatButtonModule,
    MatCardModule,
    MatListModule,
    HcpRoutingModule,
    MatExpansionModule,
    PatientAnagraphicFormModule,
    PatientExpandibleModule,
    AddressFormModule,
    HeartAppointmentFormModule,
    AppointmentsBrowserModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    LibraryModule,
    MatSidenavModule,
    MatInputModule,
    MatSelectModule,
    PatientListModule,
    MatProgressBarModule,
    PreventDoubleClickModule,
    MessageBoxModule,
  ],
  providers: [RedirectHomeRouteGuard],
})
export class HcpModule {}
