import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import { Card, ModelFeature, Suggestion } from '@eng-it4h/heart-ui-cdss';
import { TranslateService } from '@ngx-translate/core';
import { PieGridComponent } from '@swimlane/ngx-charts';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-scores-mini-card',
  templateUrl: './scores-mini-card.component.html',
  styleUrls: ['./scores-mini-card.component.scss'],
})
export class ScoresMiniCardComponent implements OnInit, OnDestroy {
  @ViewChild('piechart') chart?: PieGridComponent;
  @Input() card!: Card;
  @Input() showDate?: boolean = false;
  private destroy$ = new Subject<void>();
  protected areaSchema = CommonChartConf.areaColorScheme;
  protected scores: ModelFeature[] = [];
  protected chartData: any[] = []; // [{"name": "Germany","value": 8940000}, {...}]
  constructor(private _translateService: TranslateService) {}
  ngOnInit(): void {
    this.scores = this.card.suggestions?.at(0)?.riskScores ?? [];
    this.prepareCharts();
    this._translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.chartData = [];
        this.prepareCharts();
        this.chart?.update();
      });
  }

  private prepareCharts() {
    this.scores?.forEach((s, i) => {
      const toTranslate = s.key.code!;
      const label = this._translateService.instant(toTranslate);
      this.chartData.push({
        name: label,
        value: s.value,
      });
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
