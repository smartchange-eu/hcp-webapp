import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoDataComponent } from './components/demo-data/demo-data.component';
const routes: Routes = [
  {
    path: '',
    component: DemoDataComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DemoRoutingModule {}
