import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  CareGiver,
  CodedValue,
  Patient,
  TrialSubject,
} from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { COLUMN } from '@modules/library/components/patient-list/patient-list.component';
import { TableEntry } from '@modules/library/components/patient-list/table-entry.model';
import { TableAction } from '@modules/library/components/patient-list/table-action.model';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { FamilyDialogComponent } from '@modules/library/components/family-dialog/family-dialog.component';

@Component({
  selector: 'heart-manage-students',
  templateUrl: './manage-students.component.html',
  styleUrls: ['./manage-students.component.scss'],
})
export class ManageStudentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public patientsList: TableEntry[] = [];
  public trialSubjects: TrialSubject[] = [];
  protected lang: string;
  private DIALOG_WIDTH = '800px';
  public loading: boolean = true;
  public enahncing: boolean = true;
  protected selectedGroup?: CodedValue;
  protected pat_columns: COLUMN[] = [
    'id',
    'name',
    'family',
    'gender',
    'organization',
    'age',
    'group',
  ];

  protected actions: TableAction[] = [
    {
      key: 'welcome-email',
      label: 'resend.welcome-email.label',
      icon: 'send',
    },
    {
      key: 'add-family',
      label: 'patient.anagraphic-form.button.new-member.label',
      color: 'primary',
    },
    {
      key: 'lifestyle',
      label: 'button.view.health.history',
      color: 'primary',
      icon: 'history',
    },
  ];
  constructor(
    private _localeService: LocaleService,
    private _uas: UserAdministrationService,
    private _dataBus: DataBusService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async ngOnInit(): Promise<void> {
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });

    this._dataBus.trialList$.pipe(takeUntil(this.destroy$)).subscribe((pl) => {
      this.trialSubjects = pl;
      const entries = pl.map((ts) => {
        return {
          patient: ts.patient,
          trialGroup: ts.group,
        } as TableEntry;
      });
      this.addFamily(entries).then((list) => {
        this.patientsList = list;
        this.enahncing = false;
      });
    });

    this._dataBus.administrativeDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });
  }

  private async addFamily(entries: TableEntry[]): Promise<TableEntry[]> {
    for (let index = 0; index < entries.length; index++) {
      const element = entries[index];
      const ret = await Promise.all([this._uas.getFamily(element.patient)]);
      element.familyMembers = ret[0];
    }
    return entries;
  }

  performAction(event: { entry: TableEntry; action: string }) {
    const selectedPatient = event.entry.patient;
    switch (event.action) {
      case 'welcome-email':
        this.resendWelcomeEmail(selectedPatient);
        return;
      case 'lifestyle':
        this.viewHealthHistory(selectedPatient);
        return;
      case 'add-family':
        this.addFamilyMember(event.entry);
        return;
      default:
        return;
    }
  }

  addFamilyMember(entry: TableEntry) {
    const fm = new CareGiver();
    fm.patient = entry.patient;
    const dialogRef = this.dialog.open(FamilyDialogComponent, {
      data: { familyMember: fm, lang: this.lang },
    });

    dialogRef.componentInstance.save.subscribe((ret: CareGiver) => {
      if (ret && ret.email) {
        this._uas.addFamily(entry.patient, ret);
      }
    });
  }

  protected async resendWelcomeEmail(selectedPatient: Patient): Promise<void> {
    if (selectedPatient) {
      const msg = await lastValueFrom(
        this._localeService.translateService.get(
          'user.welcome-mail.confirmation.msg',
          { identifier: selectedPatient?.getFullName() }
        )
      );
      this.dialog
        .open(ConfirmationDialogComponent, {
          width: this.DIALOG_WIDTH,
          data: {
            title: 'user.welcome-mail.confirmation.title',
            msg: msg,
            closeLabel: 'answer.no.label',
            okLabel: 'answer.yes.label',
          },
        })
        .afterClosed()
        .subscribe((res) => {
          if (res === true) {
            this._uas.sendWelcomeEmail(selectedPatient!);
          }
        });
    }
  }

  protected viewHealthHistory(selectedPatient: Patient): void {
    if (selectedPatient) {
      const patientId = selectedPatient.id;
      this.router
        .navigate(['/web/teacher/health-history', patientId])
        .catch((error) => {
          console.error('DEBUG: Navigation failed:', error);
        });
    } else {
      console.log('DEBUG: No selected patient for health history');
    }
  }
}
