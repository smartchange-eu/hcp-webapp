import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CareGiver,
  CodedValue,
  CounsellingPrescription,
  Patient,
  Plan,
} from '@eng-it4h/heart-ui-model';
import {
  ConfirmationDialogComponent,
  SnackBarService,
} from '@eng-it4h/heart-ui-utils';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'heart-manage-appointments',
  templateUrl: './manage-appointments.component.html',
  styleUrls: ['./manage-appointments.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ManageAppointmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public serviceRequests: CounsellingPrescription[] = [];
  public lang: string;
  public loading: boolean = false;
  private DIALOG_WIDTH = '800px';
  expandedElement: CounsellingPrescription | undefined;
  //data table
  displayedColumns: string[] = ['patient', 'status', 'date', 'priority'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  dataSource: CounsellingPrescription[] = [];
  selectedFamily?: CareGiver[] = [];
  protected selectedPatientCareteamActive: boolean = false;

  selectedPriority: string[] = [];
  selectedStatus: Plan.PlanStatus[] = [];
  planStatus = Plan.PlanStatus;

  // prettier-ignore
  public constructor(
        private dialog: MatDialog,
        private _localeService : LocaleService,
        private _uas: UserAdministrationService,
        private _databus: DataBusService
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

    this._databus.allCounsellingRequests$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pl) => {
        this.loading = true;
        this.serviceRequests = pl;
        this.prepareDataTable(this.serviceRequests);
        this.loading = false;
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

  applyFilters() {
    let filtered = this.serviceRequests;
    if (this.selectedPriority.length > 0) {
      filtered = filtered.filter((sr) =>
        this.selectedPriority.some((sp) => sr?.priority?.code == sp)
      );
    }
    if (this.selectedStatus.length > 0) {
      filtered = filtered.filter((sr) =>
        this.selectedStatus.some((ss) => sr.status === ss)
      );
    }
    this.prepareDataTable(filtered);
  }
  private prepareDataTable(s: CounsellingPrescription[]): void {
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
            a.subject!.getFullName(),
            b.subject!.getFullName(),
            isAsc
          );
        case 'status':
          return compare(a.status!, b.status!, isAsc);
        case 'date':
          return compare(a.dateTime!.getTime(), b.dateTime!.getTime(), isAsc);
        case 'priority':
          return compare(a.priority!.code, b.priority!.code, isAsc);
        default:
          return 0;
      }
    });
  }

  getPriorityIcon(row: CounsellingPrescription): string {
    if (row.priority && row.priority.code) {
      switch (row.priority.code) {
        case 'routine':
          return 'priority_low';
        case 'urgent':
          return 'priority_high';
        case 'asap':
          return 'priority_urgent';
      }
    }
    return 'priority_unknown';
  }

  getPriorityLabel(row: CounsellingPrescription): string {
    if (row.priority && row.priority.code) {
      switch (row.priority.code) {
        case 'routine':
          return 'risk.initial.level.low';
        default:
        case 'urgent':
          return 'risk.initial.level.moderate';
        case 'asap':
          return 'risk.initial.level.high';
      }
    }
    return '-';
  }

  getStatusLabel(row: CounsellingPrescription): string {
    switch (row.status) {
      case Plan.PlanStatus.DRAFT:
        return 'counselling.status.draft.label';
      case Plan.PlanStatus.ACTIVE:
      default:
        return 'counselling.status.active.label';
      case Plan.PlanStatus.COMPLETED:
        return 'counselling.status.completed.label';
      case Plan.PlanStatus.REVOKED:
        return 'counselling.status.revoked.label';
    }
  }

  public doClose(row: CounsellingPrescription) {
    // open the dialog only while disabling the credentials
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'counselling.complete.confirmation.title',
          msg: 'counselling.complete.confirmation.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      // tslint:disable-next-line: deprecation
      .subscribe((res) => {
        if (res == true) {
          this.close(row);
        }
      });
  }

  public doRevoke(row: CounsellingPrescription) {
    // open the dialog only while disabling the credentials
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'counselling.revoke.confirmation.title',
          msg: 'counselling.revoke.confirmation.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      // tslint:disable-next-line: deprecation
      .subscribe((res) => {
        if (res == true) {
          this.revoke(row);
        }
      });
  }

  private close(row: CounsellingPrescription): void {
    this._uas.updatePrescriptionStatus(row, Plan.PlanStatus.COMPLETED);
    this._uas
      .enableCareTeam(row.subject!)
      .then(() => (this.selectedPatientCareteamActive = true));
  }

  private revoke(row: CounsellingPrescription): void {
    this._uas.updatePrescriptionStatus(row, Plan.PlanStatus.REVOKED);
    this._uas
      .disableCareTeam(row.subject!)
      .then(() => (this.selectedPatientCareteamActive = false));
  }

  protected doSelectSR(row: CounsellingPrescription) {
    this.expandedElement = this.expandedElement === row ? undefined : row;
    if (this.expandedElement) {
      if (this.expandedElement.subject) {
        this.addFamily(this.expandedElement.subject);
      }
    } else {
      this.selectedFamily = [];
    }
  }
  async addFamily(pid: Patient) {
    const f = await this._uas.getFamily(pid);
    this.selectedFamily = f;
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
