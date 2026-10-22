import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AddOrganizationDialogComponent } from './components/add-organization-dialog/add-organization-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PatientFamilyCardComponent } from './components/patient-family-card/patient-family-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { PlanMiniCardComponent } from './components/plan-mini-card/plan-mini-card.component';
import { NewEncounterDialogComponent } from './components/new-encounter-dialog/new-encounter-dialog.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { RiskSmallCardComponent } from './components/risk-small-card/risk-small-card.component';
import { RiskBigCardComponent } from './components/risk-big-card/risk-big-card.component';
import { RiskCardInfoComponent } from './components/risk-card-info/risk-card-info.component';
import { MatChipsModule } from '@angular/material/chips';
import { PredictionMiniCard } from './components/prediction-mini-card/prediction-mini-card.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartCommonModule, NgxChartsModule } from '@swimlane/ngx-charts';
import { TranslateModule } from '@ngx-translate/core';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '@modules/shared/shared.module';
import { PatientMeasurementsCardComponent } from './components/patient-measurements-card/patient-measurements-card.component';
import { PatientNutritionCardComponent } from './components/patient-nutrition-card/patient-nutrition-card.component';
import { NutritionBarchartComponent } from './components/nutrition-barchart/nutrition-barchart.component';
import { InitialRiskCardComponent } from './components/initial-risk-card/initial-risk-card.component';
import { ReferenceBarChartComponent } from './components/reference-barchart/reference-barchart.component';
import { YAxisComponent } from './components/reference-barchart/y-axis.component';
import { YAxisTicksComponent } from './components/reference-barchart/y-axis-ticks.component';
import { ColoredGaugeComponent } from './components/colored-gauge/colored-gauge.component';
import { FamilyDialogComponent } from './components/family-dialog/family-dialog.component';
import {
  FamilyMembersModule,
  PatientAnagraphicFormModule,
} from '@eng-it4h/heart-ui-patient';
import { ScoresMiniCardComponent } from './components/scores-mini-card/scores-mini-card.component';
import { PatientDialogComponent } from './components/patient-dialog/patient-dialog.component';
import { RiskLevelGaugeComponent } from './components/risk-level-gauge/risk-level-gauge.component';
import { RiskLevelCardComponent } from './components/risk-level-card/risk-level-card.component';
import { RiskValuePipe } from './pipes/risk-value.pipe';
import { RiskGaugeComponent } from './components/risk-gauge/risk-gauge.component';
import { RiskFactorCardComponent } from './components/risk-factor-card/risk-factor-card.component';

@NgModule({
  declarations: [
    AddOrganizationDialogComponent,
    PatientFamilyCardComponent,
    PlanMiniCardComponent,
    NewEncounterDialogComponent,
    RiskSmallCardComponent,
    RiskBigCardComponent,
    RiskLevelGaugeComponent,
    RiskCardInfoComponent,
    PredictionMiniCard,
    PatientListComponent,
    PatientMeasurementsCardComponent,
    PatientNutritionCardComponent,
    NutritionBarchartComponent,
    InitialRiskCardComponent,
    YAxisTicksComponent,
    YAxisComponent,
    ReferenceBarChartComponent,
    ColoredGaugeComponent,
    FamilyDialogComponent,
    PatientDialogComponent,
    ScoresMiniCardComponent,
    RiskLevelCardComponent,
    RiskValuePipe,
    RiskGaugeComponent,
    RiskFactorCardComponent
  ],
  imports: [
    TranslateModule.forChild(),
    ChartCommonModule,
    SharedModule,
    MatFormFieldModule,
    MatDialogModule,
    FamilyMembersModule,
    MatTooltipModule,
    FormsModule,
    MatInputModule,
    PatientAnagraphicFormModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    NgxChartsModule,
    MatCheckboxModule,
  ],
  exports: [
    PatientFamilyCardComponent,
    PlanMiniCardComponent,
    NewEncounterDialogComponent,
    RiskSmallCardComponent,
    RiskBigCardComponent,
    RiskCardInfoComponent,
    PredictionMiniCard,
    PatientListComponent,
    PatientMeasurementsCardComponent,
    PatientNutritionCardComponent,
    NutritionBarchartComponent,
    InitialRiskCardComponent,
    ReferenceBarChartComponent,
    RiskLevelGaugeComponent,
    ColoredGaugeComponent,
    ScoresMiniCardComponent,
    RiskGaugeComponent,
    RiskFactorCardComponent
  ],
})
export class LibraryModule {}
