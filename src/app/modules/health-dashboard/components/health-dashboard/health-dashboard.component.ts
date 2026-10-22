import { Component, OnInit } from '@angular/core';
import { SHOW_CONTROL_RISK } from '@config/server-configuration.conf';
import { TrialSubject } from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-health-dashboard',
  templateUrl: './health-dashboard.component.html',
  styleUrls: ['./health-dashboard.component.scss'],
})
export class HealthDashboardComponent implements OnInit {
  protected lang: string;
  private destroy$ = new Subject<void>();
  protected DIALOG_WIDTH = '800px';
  protected loading: boolean = true;
  protected control = false;
  protected showRisk = false;
  constructor(
    private _localeService: LocaleService,
    private _dataBus: DataBusService,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  public ngOnInit(): void {
    this._dataBus.patientDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });

    this._dataBus.currentGroup$
      .pipe(takeUntil(this.destroy$))
      .subscribe((p) => {
        if (p) {
          this.control = p.group.code === 'control';
          this.showRisk = SHOW_CONTROL_RISK || !this.control;
        } else {
          this.control = false;
          this.showRisk = false;
        }
      });
  }
}
