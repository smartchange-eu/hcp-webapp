import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgModule } from '@angular/core';

import { PredictionsRoutingModule } from './predictions-routing.module';
import { SuggestionsListComponent } from './components/suggestions-list/suggestions-list.component';
import {
  CdssCardInfoModule,
  CdssCardModule,
  CdssPerformanceChartModule,
  CdssSuggestionInfoModule,
} from '@eng-it4h/heart-ui-cdss';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { ExplanationComponent } from './components/explanation/explanation.component';
import { TranslateModule } from '@ngx-translate/core';
import { CardDetailComponent } from './components/card-detail/card-detail.component';
import {
  MessageBoxModule,
  PreventDoubleClickModule,
} from '@eng-it4h/heart-ui-utils';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ExpValuePipe } from './components/explanation/exp-value.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SuggestionDetailComponent } from './components/suggestion-detail/suggestion-detail.component';
import { LibraryModule } from '@modules/library/library.module';
import { SharedModule } from '@modules/shared/shared.module';
import { ComplianceCardComponent } from './components/compliance-card/compliance-card.component';

@NgModule({
  declarations: [
    SuggestionsListComponent,
    ExplanationComponent,
    CardDetailComponent,
    ExpValuePipe,
    SuggestionDetailComponent,
    ComplianceCardComponent,
  ],
  imports: [
    SharedModule,
    PredictionsRoutingModule,
    LibraryModule,
    PreventDoubleClickModule,
    TranslateModule.forChild(),
    CdssCardModule,
    MatDividerModule,
    MatProgressBarModule,
    CdssCardInfoModule,
    CdssSuggestionInfoModule,
    MatTableModule,
    MatCardModule,
    NgxChartsModule,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggleModule,
    CdssPerformanceChartModule,
    MatExpansionModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    MessageBoxModule,
  ],
})
export class PredictionsModule {}
