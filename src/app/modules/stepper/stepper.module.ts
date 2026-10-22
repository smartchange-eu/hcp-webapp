import { NgModule } from '@angular/core';
import { StepperComponent } from './stepper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '@modules/shared/shared.module';
@NgModule({
  declarations: [StepperComponent],
  imports: [SharedModule, RouterModule, MatStepperModule, MatButtonModule],
  exports: [StepperComponent],
})
export class StepperModule {}
