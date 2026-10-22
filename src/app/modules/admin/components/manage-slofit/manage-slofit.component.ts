import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import {
  CareGiver,
  CodedValue,
  Organization,
  Patient,
  TrialSubject,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import {
  SlofitData,
  SlofitDataService,
} from '@modules/service/services/slofit-data.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { Subject, takeUntil } from 'rxjs';
import { SlofitDialogComponent } from '../slofit-dialog/slofit-dialog.component';
import { CodedValueConfig } from '@config/service/coded-values.config';

@Component({
  selector: 'heart-manage-slofit',
  templateUrl: './manage-slofit.component.html',
  styleUrls: ['./manage-slofit.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class ManageSlofitComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public tSubjects: TrialSubject[] = [];
  public lang: string;
  public loading: boolean = false;
  private DIALOG_WIDTH = '800px';
  expandedElement: TrialSubject | undefined;
  selectedPriority: 'yes' | 'no' | 'rejected' | undefined = undefined;
  selectedGroup?: CodedValue;
  selectedOrganization?: Organization;
  allOrgs: Organization[] = [];
  trialGroups = CodedValueConfig.trialGroups;
  //data table
  displayedColumns: string[] = ['patient', 'organization', 'status'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  dataSource: TrialSubject[] = [];
  selectedFamily?: CareGiver[] = [];
  protected selectedPatientCareteamActive: boolean = false;

  // prettier-ignore
  public constructor(
        private dialog: MatDialog,
        private _localeService : LocaleService,
        private _uas: UserAdministrationService,
        private _databus: DataBusService,
        private _slofit: SlofitDataService
    ) {
        this.lang = _localeService.currentLanguage.toString();
    }

  public ngOnInit(): void {
    this.loading = true;
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    // load all the encounters of the selected patient

    this._databus.trialList$.pipe(takeUntil(this.destroy$)).subscribe((pl) => {
      this.loading = true;
      pl.sort((a, b) =>
        compare(a.patient?.getFullName(), b.patient?.getFullName(), true),
      );
      this.tSubjects = pl;
      this.prepareDataTable(this.tSubjects);
    });

    this._databus.administrativeDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.allOrgs = this._databus.allOrganizations;
        this.loading = !ret;
      });
  }
  applyFilters() {
    let filtered = this.tSubjects;
    if (this.selectedOrganization !== undefined) {
      filtered = filtered.filter(
        (sr) =>
          sr.patient.managingOrganization?.fhirId ==
          this.selectedOrganization?.fhirId,
      );
    }
    if (this.selectedGroup !== undefined) {
      filtered = filtered.filter(
        (sr) => sr.group.code == this.selectedGroup?.code,
      );
    }
    if (this.selectedPriority !== undefined) {
      if (this.selectedPriority == 'yes') {
        filtered = filtered.filter((sr) =>
          sr.patient.additionalIdentifiers.some((id) => {
            return (
              id.system == this._slofit.slofit_system &&
              id.use == this._slofit.SECONDARY
            );
          }),
        );
      } else if (this.selectedPriority == 'rejected') {
        filtered = filtered.filter((sr) =>
          sr.patient.additionalIdentifiers.some((id) => {
            return (
              id.system == environment.slofitPidSystem &&
              (id.use == this._slofit.TEMP || id.use == this._slofit.OLD)
            );
          }),
        );
      } else if (this.selectedPriority == 'no') {
        filtered = filtered.filter((sr) => {
          return (
            sr.patient.additionalIdentifiers.length == 0 ||
            sr.patient.additionalIdentifiers.some((id) => {
              return id.system != this._slofit.slofit_system;
            })
          );
        });
      }
    }
    this.prepareDataTable(filtered);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private prepareDataTable(s: TrialSubject[]): void {
    this.dataSource = s ?? [];
  }

  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource = data;
      return;
    }

    this.dataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'patient':
          return compare(
            a.patient?.getFullName(),
            b.patient?.getFullName(),
            isAsc,
          );
        default:
          return 0;
      }
    });
  }

  protected doSelectSR(row: TrialSubject) {
    this.expandedElement = this.expandedElement === row ? undefined : row;
    if (this.expandedElement) {
      if (this.expandedElement.patient) {
        this.addFamily(this.expandedElement.patient);
      }
    } else {
      this.selectedFamily = [];
    }
  }

  async addFamily(pid: Patient) {
    const f = await this._uas.getFamily(pid);
    this.selectedFamily = f;
  }

  connected(row: TrialSubject): boolean {
    return row.patient.additionalIdentifiers.some((id) => {
      return id.system == this._slofit.slofit_system && id.use == 'secondary';
    });
  }
  getStatusIcon(row: TrialSubject): string {
    const id = row.patient.additionalIdentifiers.find((id) => {
      return id.system == this._slofit.slofit_system;
    });
    if (id == undefined || id.use == this._slofit.TEMP) {
      return '';
    } else if (id.use == this._slofit.SECONDARY) {
      return 'done';
    } else return 'close';
  }

  doAdd(row: TrialSubject) {
    const dialogRef = this.dialog.open(SlofitDialogComponent, {
      width: this.DIALOG_WIDTH,
      data: {
        familyMembers: this.selectedFamily,
        lang: this.lang,
        p: row.patient,
      },
    });

    dialogRef.componentInstance.save.subscribe((ret: SlofitData) => {
      if (ret) {
        console.log(ret);
        this._slofit.registerSlofitUser(row.patient, ret);
      }
    });
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
