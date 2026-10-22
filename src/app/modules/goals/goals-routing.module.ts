import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanSummaryComponent } from './components/plan-summary/plan-summary.component';
import { PlanDefinitionComponent } from './components/plan-definition/plan-definition.component';
import { PrescriptionRouteGuard } from '@modules/core/services/prescription-route.guard';

const planGuard = [PrescriptionRouteGuard];
const routes: Routes = [
  {
    path: '',
    canActivate: planGuard,
    children: [],
    pathMatch: 'full',
  },
  {
    path: 'new',
    component: PlanDefinitionComponent,
    data: {
      breadcrumb: { label: 'plan.new.bc' },
    },
  },
  {
    path: 'edit',
    component: PlanSummaryComponent,
    data: {
      breadcrumb: { label: 'plan.edit.bc' },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoalsRoutingModule {}
