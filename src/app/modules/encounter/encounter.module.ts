import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { PreventDoubleClickModule } from '@eng-it4h/heart-ui-utils';
import { EncounterDashboardComponent } from './encounter-dashboard/encounter-dashboard.component';
import { EncounterRoutingModule } from './encounter-routing.module';

import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  DynBuiltQuestionnaireModule,
  QuestionnaireSectionModule,
} from '@eng-it4h/heart-ui-questionnaire';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { PatientExpandibleModule } from '@eng-it4h/heart-ui-patient';
import { MessageBoxModule } from '@eng-it4h/heart-ui-utils';
import { SharedModule } from '@modules/shared/shared.module';
import { StepperModule } from '@modules/stepper/stepper.module';
import { ButtonBarPaginationComponent } from './button-bar-pagination/button-bar-pagination.component';
import { EncounterDetailPipe } from './encounter-info/encounter-detail.pipe';
import { EncounterInfoComponent } from './encounter-info/encounter-info.component';
import { EncounterService } from './encounter.service';
import { HealthHistoryComponent } from './halth-history/health-history.component';
import { LifestyleComponent } from './lifestyle/lifestyle.component';
import { LanguageConfig } from '@config/language.conf';
import { GenericQuantitativeFormModule } from '@eng-it4h/heart-ui-measure';
import { MatCardModule } from '@angular/material/card';
@NgModule({
  declarations: [
    ButtonBarPaginationComponent,
    EncounterDashboardComponent,
    HealthHistoryComponent,
    LifestyleComponent,
    EncounterInfoComponent,
    EncounterDetailPipe,
  ],
  imports: [
    SharedModule,
    RouterModule,
    EncounterRoutingModule,
    MatToolbarModule,
    FormsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSidenavModule,
    MatTabsModule,
    StepperModule,
    PatientExpandibleModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    DynBuiltQuestionnaireModule,
    QuestionnaireSectionModule.forRoot({
      matDateLocale: LanguageConfig.DEFAULT_LANGUAGE.fnsAdapterLocale,
    }),
    GenericQuantitativeFormModule,
    PreventDoubleClickModule,
    MessageBoxModule,
  ],
  providers: [EncounterService],
})
export class EncounterModule {}
