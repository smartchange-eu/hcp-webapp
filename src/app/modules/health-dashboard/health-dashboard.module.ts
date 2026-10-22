import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgModule } from '@angular/core';

import { HealthDashboardRoutingModule } from './health-dashboard-routing.module';
import { SummaryComponent } from './components/summary/summary.component';
import { HealthDashboardComponent } from './components/health-dashboard/health-dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { RiskComponent } from './components/risk/risk.component';
import { GoalsComponent } from './components/goals/goals.component';
import { MatIconModule } from '@angular/material/icon';
import { PatientExpandibleModule } from '@eng-it4h/heart-ui-patient';
import { HeartEncounterTableModule } from '@eng-it4h/heart-ui-encounter';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MessageBoxModule } from '@eng-it4h/heart-ui-utils';
import { MatButtonModule } from '@angular/material/button';
import { HistoryComponent } from './components/history/history.component';
import { MatCardModule } from '@angular/material/card';
import { EncountersComponent } from './components/encounters/encounters.component';
import {
  QuantitativeBarchartModule,
  QuantitativeLinechartModule,
} from '@eng-it4h/heart-ui-measure';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { GoalsModule } from '@modules/goals/goals.module';
import { LibraryModule } from '@modules/library/library.module';
import { SharedModule } from '@modules/shared/shared.module';
import { QuestionnaireSectionModule } from '@eng-it4h/heart-ui-questionnaire';
import { LanguageConfig } from '@config/language.conf';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    SummaryComponent,
    HealthDashboardComponent,
    RiskComponent,
    GoalsComponent,
    HistoryComponent,
    EncountersComponent,
  ],
  imports: [
    SharedModule,
    LibraryModule,
    HealthDashboardRoutingModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    PatientExpandibleModule,
    HeartEncounterTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    QuantitativeLinechartModule,
    QuantitativeBarchartModule,
    // DynBuiltQuestionnaireModule,
    QuestionnaireSectionModule.forRoot({
      matDateLocale: LanguageConfig.DEFAULT_LANGUAGE.fnsAdapterLocale,
    }),
    MatProgressBarModule,
    MessageBoxModule,
    GoalsModule,
    MatSidenavModule,
  ],
})
export class HealthDashboardModule {}
