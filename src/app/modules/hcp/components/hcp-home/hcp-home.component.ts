import { Component, OnDestroy, OnInit } from '@angular/core';
import { TrialSubject } from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { PatientService } from '@modules/service/services/patient.service';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { Subject, takeUntil } from 'rxjs';
import { TableEntry } from '@modules/library/components/patient-list/table-entry.model';
import { COLUMN } from '@modules/library/components/patient-list/patient-list.component';

@Component({
  selector: 'heart-hcp-home',
  templateUrl: './hcp-home.component.html',
  styleUrls: ['./hcp-home.component.scss'],
})
export class HcpHomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public trialSubjects: TrialSubject[] = [];
  public trialList: TableEntry[] = [];
  protected lang: string;
  public loading: boolean = true;
  protected pat_columns: COLUMN[] = [
    'id',
    'name',
    'family',
    'username',
    'organization',
    'gender',
    'age',
  ];

  public constructor(
    private _localeService: LocaleService,
    private _patientService: PatientService,
    private _patientManagement: UserAdministrationService,
    private _databus: DataBusService,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  public async ngOnInit(): Promise<void> {
    this.loading = true;
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });

    // load all the encounters of the selected patient
    this._databus.trialList$.pipe(takeUntil(this.destroy$)).subscribe((tg) => {
      this.trialSubjects = tg;
      this.trialList = tg.map((ts) => {
        return {
          patient: ts.patient,
          trialGroup: ts.group,
        } as TableEntry;
      });
    });

    this._databus.administrativeDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public selectedPatient(ts: TableEntry): void {
    if (environment.debug) {
      console.log('selected ' + ts.patient?.fhirId);
    }
    try {
      this._patientService.switchCurrentPatient(ts.patient, true);
    } catch (e) {
      //TODO: send error
    }
  }
  public async reloadList(): Promise<void> {
    await this._patientManagement.reloadAdministrativeData();
  }
}
