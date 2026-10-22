import { NgModule } from '@angular/core';
import { CanDeactivateFn, RouterModule, Routes } from '@angular/router';

import { PhysicalExaminationComponent } from './physical-examination.component';
import { StepComponent } from '@modules/stepper/step-component';
export const hasUnsavedChangesGuard: CanDeactivateFn<StepComponent> = (
  component: StepComponent
): boolean => {
  return component.canDeactivate();
};

const routes: Routes = [
  {
    path: '',
    component: PhysicalExaminationComponent,
    canDeactivate: [hasUnsavedChangesGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhysicalExaminationRoutingModule {}
