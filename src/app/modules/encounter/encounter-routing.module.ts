import { NgModule } from '@angular/core';
import { CanDeactivateFn, RouterModule, Routes } from '@angular/router';

import pe_conf from '@config/forms/phys-exam-sc.json';

import { EncounterSessionGuard } from '@modules/core/services/encounter-session.guard';
import { StepComponent } from '@modules/stepper/step-component';
import { EncounterDashboardComponent } from './encounter-dashboard/encounter-dashboard.component';
import { EncounterInfoComponent } from './encounter-info/encounter-info.component';
import { HealthHistoryComponent } from './halth-history/health-history.component';
import { LifestyleComponent } from './lifestyle/lifestyle.component';

import { environment } from '@env/environment';

import mmolForm from '@config/forms/lab-results-sc.json';
import mgForm from '@config/forms/lab-results-sc_mg.json';

const selectedLabForm =
  environment.labDefaultUnit === 'MG_DL' ? mgForm : mmolForm;

const encounterGuard = [EncounterSessionGuard];

export const hasUnsavedChangesGuard: CanDeactivateFn<StepComponent> = (
  component: StepComponent
): boolean => {
  return component.canDeactivate();
};

const routes: Routes = [
  {
    path: '',
    canActivate: encounterGuard,
    component: EncounterDashboardComponent,
    data: {
      breadcrumb: { label: 'encounter.page.bc' },
    },
    children: [
      {
        path: 'lab-results',
        loadChildren: () =>
          import('./physical-examination/physical-examination.module').then(
            (m) =>
              m.PhysicalExaminationModule.configure({
                structure: selectedLabForm,
                mandDate: true,
                mandNotes: false,
              })
          ),
        data: { breadcrumb: { label: 'episode.button.lab.label' } },
      },
      {
        path: 'review',
        component: EncounterInfoComponent,
        data: { breadcrumb: { label: 'encounter.info.bc' } },
      },
      {
        path: 'lifestyle',
        component: LifestyleComponent,
        data: { breadcrumb: { label: 'lifestyle.page.bc' } },
      },
      {
        path: 'history',
        component: HealthHistoryComponent,
        data: { breadcrumb: { label: 'history.page.bc' } },
        canDeactivate: [hasUnsavedChangesGuard],
      },
      {
        path: 'physical-exam',
        loadChildren: () =>
          import('./physical-examination/physical-examination.module').then(
            (m) =>
              m.PhysicalExaminationModule.configure({
                structure: pe_conf,
                mandDate: false,
                mandNotes: false,
              })
          ),
        data: { breadcrumb: { label: 'phys-exam.page.bc' } },
      },
      { path: '', pathMatch: 'full', redirectTo: 'history' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncounterRoutingModule {}
