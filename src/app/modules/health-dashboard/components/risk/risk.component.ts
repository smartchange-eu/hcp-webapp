import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Plan, Risk } from '@eng-it4h/heart-ui-model';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { findOldestPrediction } from '@modules/service/services/oldest-prediction.function';
import { SuggestionService } from '@modules/service/services/suggestion.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.scss'],
})
export class RiskComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public loading: boolean = true;

  protected risks: Risk[] = [];
  protected oldestPrediction = findOldestPrediction;
  protected plan?: Plan;
  protected initialRisk: Risk | undefined;
  protected control: boolean = false;

  constructor(
    private router: Router,
    private _databus: DataBusService,
    private r: ActivatedRoute,
    private _predictionService: SuggestionService,
  ) {}
  public async ngOnInit(): Promise<void> {
    // load all the encounters of the selected patient
    this._databus.currentRisks$
      .pipe(takeUntil(this.destroy$))
      .subscribe((risks) => {
        this.risks = risks;
      });
    this._databus.initialRisk$
      .pipe(takeUntil(this.destroy$))
      .subscribe((risk) => {
        this.initialRisk = risk;
      });
    this._databus.currentPlan$
      .pipe(takeUntil(this.destroy$))
      .subscribe((plan) => {
        this.plan = plan;
      });
    this._databus.patientDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });
    this._databus.currentGroup$
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => {
        if (p) {
          this.control = p.group.code === 'control';
        } else {
          this.control = false;
        }
      });
  }

  openCard(id: string) {
    //TODO: open card
    console.log('card id: ' + id);
    if (this._predictionService.selectCardById(id)) {
      this.router.navigate(['../predictions'], {
        relativeTo: this.r,
      });
    } else console.log('card not found');
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToGoals() {
    this.router.navigate(['../../goals'], { relativeTo: this.r });
  }
}
