import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoRoutingModule } from './demo-routing.module';
import { SharedModule } from '@modules/shared/shared.module';
import { RouterModule } from '@angular/router';
import {
  DynBuiltQuestionnaireModule,
  QuestionnaireSectionModule,
} from '@eng-it4h/heart-ui-questionnaire';
import { LanguageConfig } from '@config/language.conf';
import { GenericQuantitativeFormModule } from '@eng-it4h/heart-ui-measure';
import { DemoDataComponent } from './components/demo-data/demo-data.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PatientExpandibleModule } from '@eng-it4h/heart-ui-patient';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MessageBoxModule } from '@eng-it4h/heart-ui-utils';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [DemoDataComponent],
  imports: [
    SharedModule,
    RouterModule,
    DemoRoutingModule,
    DynBuiltQuestionnaireModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MessageBoxModule,
    MatTabsModule,
    PatientExpandibleModule,
    QuestionnaireSectionModule.forRoot({
      matDateLocale: LanguageConfig.DEFAULT_LANGUAGE.fnsAdapterLocale,
    }),
    GenericQuantitativeFormModule,
  ],
})
export class DemoModule {}
