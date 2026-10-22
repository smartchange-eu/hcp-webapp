import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { HealthDashboardComponent } from './components/health-dashboard/health-dashboard.component';
import { RiskComponent } from './components/risk/risk.component';
import { GoalsComponent } from './components/goals/goals.component';
import { HistoryComponent } from './components/history/history.component';
import { EncountersComponent } from './components/encounters/encounters.component';
import { InterventionPatientSessionGuard } from '@modules/core/services/intervention-patient-session.guard';
const patientGuard = [InterventionPatientSessionGuard];

const routes: Routes = [
  {
    path: '',
    component: HealthDashboardComponent,
    data: {
      breadcrumb: { label: 'health-dashboard.page.bc' },
    },
    children: [
      {
        path: 'summary',
        component: SummaryComponent,
        data: {
          breadcrumb: { label: 'health-dashboard.summary-page.bc' },
        },
      },
      {
        path: 'risk',
        canActivate: patientGuard,
        children: [
          {
            path: 'list',
            component: RiskComponent,
            data: { breadcrumb: { skip: true } },
          },
          {
            path: 'predictions',
            loadChildren: () =>
              import('../predictions/predictions.module').then(
                (m) => m.PredictionsModule
              ),
            data: { breadcrumb: { skip: true } },
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'list',
          },
        ],
        data: {
          breadcrumb: { label: 'health-dashboard.risk-page.bc' },
        },
      },
      {
        path: 'goals',
        canActivate: patientGuard,
        children: [
          {
            path: 'list',
            component: GoalsComponent,
            data: { breadcrumb: { skip: true } },
          },
          {
            path: 'plan',
            loadChildren: () =>
              import('../goals/goals.module').then((m) => m.GoalsModule),
            data: { breadcrumb: { skip: true } },
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'list',
          },
        ],
        data: {
          breadcrumb: { label: 'health-dashboard.goals-page.bc' },
        },
      },
      {
        path: 'history',
        component: HistoryComponent,
        data: {
          breadcrumb: { label: 'health-dashboard.history-page.bc' },
        },
      },
      {
        path: 'encounters',
        children: [
          {
            path: 'list',
            component: EncountersComponent,
            data: { breadcrumb: { skip: true } },
          },
          {
            path: 'encounter',
            loadChildren: () =>
              import('../encounter/encounter.module').then(
                (m) => m.EncounterModule
              ),
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'list',
          },
        ],
        data: {
          breadcrumb: { label: 'health-dashboard.episodes-page.bc' },
        },
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'summary',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HealthDashboardRoutingModule {}
