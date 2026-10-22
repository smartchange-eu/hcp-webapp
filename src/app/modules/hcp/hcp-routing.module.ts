import { HcpHomeComponent } from './components/hcp-home/hcp-home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { PatientSessionGuard } from '@modules/core/services/patient-session.guard';
import { Role } from '@eng-it4h/heart-ui-model';
import { RedirectHomeRouteGuard } from './redirect-home-route.guard';

const patientGuard = [PatientSessionGuard];

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: patientGuard,
    loadChildren: () =>
      import('../health-dashboard/health-dashboard.module').then(
        (m) => m.HealthDashboardModule,
      ),
    data: {
      roles: [Role.PRACTITIONER, Role.NURSE],
      breadcrumb: { label: 'health-dashboard.page.bc', info: 'home' },
    },
  },
  {
    path: 'select',
    component: HcpHomeComponent,
    data: {
      breadcrumb: { label: 'hcp.select.page.bc' },
    },
  },
  {
    path: 'add-patient',
    component: AddPatientComponent,
    data: {
      breadcrumb: { label: 'add-patient.page.bc' },
    },
  },
  {
    path: '',
    canActivate: [RedirectHomeRouteGuard],
    children: [],
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HcpRoutingModule {}
