import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NewHcpFormModule, UserListModule } from '@eng-it4h/heart-ui-user';
import { AdminRoutingModule } from './admin-routing.module';
import { AddPractitionerComponent } from './components/add-practitioner/add-practitioner.component';
import { ListPractitionersComponent } from './components/list-practitioners/list-practitioners.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ManageOrgsComponent } from './components/manage-orgs/manage-orgs.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import {
  PatientAnagraphicFormModule,
  PatientListModule,
} from '@eng-it4h/heart-ui-patient';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { LibraryModule } from '@modules/library/library.module';
import { SharedModule } from '@modules/shared/shared.module';
import { ManageAppointmentsComponent } from './components/manage-appointments/manage-appointments.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddAdminComponent } from './components/add-admin/add-admin.component';
import { MatSortModule } from '@angular/material/sort';
import { SlofitDialogComponent } from './components/slofit-dialog/slofit-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { ManageSlofitComponent } from './components/manage-slofit/manage-slofit.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    AddPractitionerComponent,
    AddAdminComponent,
    ListPractitionersComponent,
    ManageOrgsComponent,
    ManageUsersComponent,
    ManageAppointmentsComponent,
    ManageSlofitComponent,
    SlofitDialogComponent,
    AddPatientComponent,
  ],
  imports: [
    SharedModule,
    LibraryModule,
    HttpClientModule,
    NewHcpFormModule,
    UserListModule,
    MatProgressBarModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatInputModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    PatientListModule,
    PatientAnagraphicFormModule,
    MatCardModule,
    AdminRoutingModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslateModule.forChild(),
    MatTooltipModule,
  ],
})
export class AdminModule {}
