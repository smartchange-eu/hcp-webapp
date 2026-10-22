import { ListPractitionersComponent } from './components/list-practitioners/list-practitioners.component';
import { NgModule } from '@angular/core';
import { CanMatchFn, RouterModule, Routes } from '@angular/router';
import { AddPractitionerComponent } from './components/add-practitioner/add-practitioner.component';
import { ManageOrgsComponent } from './components/manage-orgs/manage-orgs.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { ManageAppointmentsComponent } from './components/manage-appointments/manage-appointments.component';
import { AddAdminComponent } from './components/add-admin/add-admin.component';
import { ManageSlofitComponent } from './components/manage-slofit/manage-slofit.component';
import { environment } from '@env/environment';
export const checkSlofit: CanMatchFn = (route, segments) => {
  const envVarValue = environment.slofitPidSystem || '';
  return envVarValue.length > 0;
};

export const checkDemo: CanMatchFn = (route, segments) => {
  return !environment.production || environment.testEnv == 'true';
};

const routes: Routes = [
  {
    path: 'hcp-registry',
    component: ListPractitionersComponent,
    data: { breadcrumb: { label: 'admin.registry.page.bc' } },
  },
  {
    path: 'add-hcp',
    component: AddPractitionerComponent,
    data: {
      breadcrumb: { label: 'admin.add.hcp.page.bc', info: 'person_add_alt' },
    },
  },
  {
    path: 'add-admin',
    component: AddAdminComponent,
    data: {
      breadcrumb: { label: 'admin.add.admin.page.bc', info: 'person_add_alt' },
    },
  },
  {
    path: 'manage-users',
    component: ManageUsersComponent,
    data: {
      breadcrumb: {
        label: 'admin.manage.patients.page.bc',
      },
    },
  },
  {
    path: 'manage-slofit',
    canMatch: [checkSlofit],
    component: ManageSlofitComponent,
    data: {
      breadcrumb: {
        label: 'Slofit',
      },
    },
  },
  {
    path: 'add-user',
    component: AddPatientComponent,
    data: {
      breadcrumb: {
        label: 'admin.manage-patients.page.bc',
        info: 'person_add',
      },
    },
  },
  {
    path: 'manage-organizations',
    component: ManageOrgsComponent,
    data: {
      breadcrumb: {
        label: 'admin.manage-orgs.page.bc',
        info: 'business',
      },
    },
  },
  {
    path: 'manage-appointments',
    component: ManageAppointmentsComponent,
    data: {
      breadcrumb: {
        label: 'appointments.page.bc',
        info: 'event',
      },
    },
  },
  {
    path: 'demo',
    canMatch: [checkDemo],
    loadChildren: () => import('../demo/demo.module').then((m) => m.DemoModule),
    data: {
      breadcrumb: {
        label: 'Demo',
      },
    },
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'hcp-registry',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
