import { MatExpansionModule } from '@angular/material/expansion';
import { InjectionToken, NgModule } from '@angular/core';
import { PhysicalExaminationComponent } from './physical-examination.component';
import { PhysicalExaminationRoutingModule } from './physical-examination-routing.module';
import {
  GenericQuantitativeFormModule,
  QuantitativeLinechartModule,
} from '@eng-it4h/heart-ui-measure';
import { SharedModule } from '@modules/shared/shared.module';
import { MessageBoxModule } from '@eng-it4h/heart-ui-utils';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { GenericQuantitativeFormStructure } from '@eng-it4h/heart-ui-model';
import { PhysicalExaminationService } from './physical-examination.service';

export const PE_CONFIG = new InjectionToken<PhysicalExaminationModuleConfig>(
  'PE Module Config'
);

export class PhysicalExaminationModuleConfig {
  structure?: GenericQuantitativeFormStructure;
  mandDate: boolean = true;
  mandNotes: boolean = false;
}

@NgModule({
  declarations: [PhysicalExaminationComponent],
  imports: [
    SharedModule,
    PhysicalExaminationRoutingModule,
    GenericQuantitativeFormModule,
    MessageBoxModule,
    MatCardModule,
    MatExpansionModule,
    QuantitativeLinechartModule,
    TranslateModule.forChild(),
    MatProgressBarModule,
    MatDividerModule,
  ],
  providers: [
    {
      provide: PE_CONFIG,
      useFactory: () => {
        return PhysicalExaminationModule.config;
      },
    },
    PhysicalExaminationService,
  ],
})
export class PhysicalExaminationModule {
  static config: PhysicalExaminationModuleConfig;
  static configure(ext_config: any): typeof PhysicalExaminationModule {
    this.config = Object.create(PhysicalExaminationModuleConfig.prototype);
    Object.assign(this.config, ext_config);
    return this;
  }
}
