import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuggestionsListComponent } from './components/suggestions-list/suggestions-list.component';
import { ExplanationComponent } from './components/explanation/explanation.component';

const routes: Routes = [
  {
    path: 'list',
    component: SuggestionsListComponent,
    data: {
      breadcrumb: { label: 'predictions.list.bc' },
    },
  },
  // {
  //   path: 'explanation',
  //   component: ExplanationComponent,
  //   data: {
  //     breadcrumb: { label: 'predictions.explanation.bc' },
  //   },
  // },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PredictionsRoutingModule {}
