import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PatientExpandibleModule } from '@eng-it4h/heart-ui-patient';
import { MessageBoxModule } from '@eng-it4h/heart-ui-utils';
import { SharedModule } from '@modules/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComboChartComponent } from './components/combo-chart/combo-chart.component';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { GoalSelectionDialogComponent } from './components/goal-selection-dialog/goal-selection.dialog';
import { GoalsComponent } from './components/goals/goals.component';
import { PlanDefinitionComponent } from './components/plan-definition/plan-definition.component';
import { PlanSummaryComponent } from './components/plan-summary/plan-summary.component';
import { TargetCardBarchartComponent } from './components/target-card-barchart/target-card-barchart.component';
import { TargetCardLinechartComponent } from './components/target-card-linechart/target-card-linechart.component';
import { TargetFormComponent } from './components/target-form/target-form.component';
import { GoalsRoutingModule } from './goals-routing.module';
import { TargetCardNutritionComponent } from './components/target-card-nutrition/target-card-nutrition.component';
import { LibraryModule } from '@modules/library/library.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    PlanDefinitionComponent,
    PlanSummaryComponent,
    GoalsComponent,
    GoalCardComponent,
    GoalSelectionDialogComponent,
    TargetFormComponent,
    TargetCardLinechartComponent,
    TargetCardBarchartComponent,
    ComboChartComponent,
    TargetCardNutritionComponent,
  ],
  imports: [
    SharedModule,
    GoalsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSidenavModule,
    MatExpansionModule,
    MatListModule,
    MatCardModule,
    MatRadioModule,
    MessageBoxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatIconModule,
    PatientExpandibleModule,
    MatTooltipModule,
    TranslateModule.forChild(),
    MatDatepickerModule,
    NgxChartsModule,
    LibraryModule,
  ],
  exports: [GoalsComponent],
})
export class GoalsModule {}
