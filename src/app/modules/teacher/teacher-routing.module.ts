import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageStudentsComponent } from './components/manage-students/manage-students.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { TeacherHealthHistoryComponent } from './components/teacher-health-history/teacher-health-history.component';

const routes: Routes = [
  {
    path: 'students-registry',
    component: ManageStudentsComponent,
    data: {
      breadcrumb: { label: 'teacher.manage.page.bc', info: 'history_edu' },
    },
  },
  {
    path: 'add-student',
    component: AddPatientComponent,
    data: {
      breadcrumb: { label: 'teacher.manage.page.bc', info: 'history_edu' },
    },
  },
  {
    path: 'health-history/:patientId',
    component: TeacherHealthHistoryComponent,
    data: {
      breadcrumb: { label: 'teacher.health.history.page.bc', info: 'history' },
    },
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'students-registry',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
