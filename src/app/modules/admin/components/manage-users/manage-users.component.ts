import { cloneDeep } from 'lodash';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CareGiver, CodedValue, Patient, User } from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { FamilyDialogComponent } from '@modules/library/components/family-dialog/family-dialog.component';
import { PatientDialogComponent } from '@modules/library/components/patient-dialog/patient-dialog.component';
import { COLUMN } from '@modules/library/components/patient-list/patient-list.component';
import { TableAction } from '@modules/library/components/patient-list/table-action.model';
import { TableEntry } from '@modules/library/components/patient-list/table-entry.model';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { environment } from '@env/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { DemoAdministrationService } from '@modules/demo/demo-administration.service';

@Component({
  selector: 'heart-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public patientsList: TableEntry[] = [];
  protected lang: string;
  private DIALOG_WIDTH = '800px';
  public loading: boolean = true;
  public enhancing: boolean = true;
  protected selectedGroup?: CodedValue;
  protected actions: TableAction[] = [
    {
      key: 'welcome-email',
      label: 'resend.welcome-email.label',
      icon: 'send',
      color: 'primary',
    },
    { key: 'data-access', label: 'toggle.care-team.label', color: 'primary' },
    {
      key: 'add-family',
      label: 'patient.anagraphic-form.button.new-member.label',
      color: 'primary',
    },
    { key: 'enable', color: 'primary', label: 'user.list.enable.label' },
    { key: 'edit', icon: 'edit', color: 'primary' },
    { key: 'delete', icon: 'delete', color: 'warn' },
  ];
  protected pat_columns: COLUMN[] = [
    'id',
    'name',
    'family',
    'username',
    'gender',
    'age',
    'organization',
    'enable',
    'group',
  ];
  private demoService?: DemoAdministrationService;

  constructor(
    private _localeService: LocaleService,
    private _uas: UserAdministrationService,
    private _databus: DataBusService,
    private dialog: MatDialog,
    private r: ActivatedRoute,
    private router: Router,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    if (!environment.production || environment.testEnv == 'true') {
      this.demoService = inject(DemoAdministrationService);
      this.actions.push({ key: 'demo', icon: 'addchart', color: 'accent' });
    }
  }

  public async ngOnInit(): Promise<void> {
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });

    this._databus.trialList$.pipe(takeUntil(this.destroy$)).subscribe((pl) => {
      const entries = pl
        .map((ts) => {
          return {
            patient: ts.patient,
            trialGroup: ts.group,
          } as TableEntry;
        })
        .filter((t) => t != undefined) as TableEntry[];
      this.addUser(entries).then((list) => {
        this.addFamily(list).then((flist) => {
          this.patientsList = flist;
          this.enhancing = false;
        });
      });
    });

    this._databus.administrativeDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });
  }

  private async addFamily(entries: TableEntry[]): Promise<TableEntry[]> {
    for (let index = 0; index < entries.length; index++) {
      const element = entries[index];
      const ret = await Promise.all([
        this._uas.getFamily(element.patient),
        this._uas.isActiveCareTeam(element.patient),
      ]);
      element.familyMembers = ret[0];
      element.dataVisible = ret[1];
    }
    return entries;
  }

  private async addUser(entries: TableEntry[]): Promise<TableEntry[]> {
    const users = await this._uas.loadUsers('Patient');
    for (let index = 0; index < entries.length; index++) {
      const element = entries[index];
      element.user = users.find((u) => u.person.id == element.patient.id);
    }
    return entries;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performAction(event: { entry: TableEntry; action: string }) {
    switch (event.action) {
      case 'welcome-email':
        this.resendWelcomeEmail(event.entry.patient);
        return;
      case 'data-access':
        this.toggleAccess(event.entry);
        return;
      case 'delete':
        this.delteUser(event.entry.patient);
        return;
      case 'add-family':
        this.addFamilyMember(event.entry);
        return;
      case 'edit':
        this.editPatient(event.entry);
        return;
      case 'demo':
        this.openDemoDataDialog(event.entry);
        return;
      case 'enable':
        this.openEnableUserDialog(event.entry);
        return;
      default:
        return;
    }
  }

  public async openDemoDataDialog(p: TableEntry): Promise<void> {
    if (this.demoService) {
      const msg =
        'You are about to open the demo data page. DO NOT USE FOR REAL USERS! The page allows to generate mock data for this user overwriting the current ones. If you are not sure how it works please go back.';
      this.dialog
        .open(ConfirmationDialogComponent, {
          width: this.DIALOG_WIDTH,
          data: {
            title: 'DEMO DATA PAGE',
            msg: msg,
            closeLabel: 'answer.no.label',
            okLabel: 'answer.yes.label',
          },
        })
        .afterClosed()
        .subscribe((res) => {
          if (res == true && this.demoService) {
            this.demoService.patient = p.patient;
            this.router.navigate(['../demo'], { relativeTo: this.r });
          }
        });
    }
  }
  public async openEnableUserDialog(p: TableEntry): Promise<void> {
    const user = p.user;
    if (user) {
      if (user?.enabled == false) {
        this.enableUser(user);
      } else {
        const msg = await lastValueFrom(
          this._localeService.translateService.get(
            'user.disable.confirmation.msg',
            { identifier: user.username },
          ),
        );
        // open the dialog only while disabling the credentials
        this.dialog
          .open(ConfirmationDialogComponent, {
            width: this.DIALOG_WIDTH,
            data: {
              title: 'user.disable.confirmation.title',
              msg: msg,
              closeLabel: 'answer.no.label',
              okLabel: 'answer.yes.label',
            },
          })
          .afterClosed()
          // tslint:disable-next-line: deprecation
          .subscribe((res) => {
            if (res == true) {
              this.disableUser(user);
            }
          });
      }
    }
  }

  private async enableUser(user: User): Promise<void> {
    this._uas.enableUser(user);
  }

  private async disableUser(user: User): Promise<void> {
    this._uas.disableUser(user);
  }

  addFamilyMember(entry: TableEntry) {
    const fm = new CareGiver();
    fm.patient = entry.patient;
    const dialogRef = this.dialog.open(FamilyDialogComponent, {
      data: { familyMember: fm, lang: this.lang },
    });

    dialogRef.componentInstance.save.subscribe((ret: CareGiver) => {
      if (ret && ret.name) {
        this._uas
          .addFamily(entry.patient, ret)
          .then((fam) => (entry.familyMembers = fam));
      }
    });
  }

  editPatient(entry: TableEntry) {
    const toEdit = cloneDeep(entry.patient);
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      data: { patient: toEdit, lang: this.lang },
    });

    dialogRef.componentInstance.save.subscribe((ret: Patient) => {
      if (ret) {
        const merged = cloneDeep(entry.patient);
        merged.firstName = ret.firstName;
        merged.lastName = ret.lastName;
        merged.gender = ret.gender;
        this._uas.updateUser(merged);
      }
    });
  }
  toggleAccess(entry: TableEntry) {
    if (entry.dataVisible) this.disableCareTeam(entry);
    else if (!entry.dataVisible) {
      this.enableCareTeam(entry);
    }
  }

  protected async resendWelcomeEmail(selectedPatient: Patient) {
    const msg = await lastValueFrom(
      this._localeService.translateService.get(
        'user.welcome-mail.confirmation.msg',
        { identifier: selectedPatient?.getFullName() },
      ),
    );
    // open the dialog only while disabling the credentials
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
        if (res == true) {
          this._uas.sendWelcomeEmail(selectedPatient!);
        }
      });
  }

  protected async delteUser(selectedPatient: Patient) {
    if (selectedPatient) {
      const msg = await lastValueFrom(
        this._localeService.translateService.get(
          'user.deletion.confirmation.msg',
          { identifier: selectedPatient?.getFullName() },
        ),
      );
      // open the dialog only while disabling the credentials
      this.dialog
        .open(ConfirmationDialogComponent, {
          width: this.DIALOG_WIDTH,
          data: {
            title: 'user.deletion.confirmation.title',
            msg: msg,
            closeLabel: 'answer.no.label',
            okLabel: 'answer.yes.label',
          },
        })
        .afterClosed()
        .subscribe((res) => {
          if (res == true) {
            this._uas.deletePatient(selectedPatient!);
          }
        });
    }
  }
  async doRemoveFM(data: { entry: TableEntry; fm: CareGiver }) {
    // open the dialog only while disabling the credentials
    const fm = data.fm;
    const name = fm.firstName + (fm.lastName ? ' ' + fm.lastName : '');
    const msg = await lastValueFrom(
      this._localeService.translateService.get(
        'family-member.deletion.confirmation.msg',
        { identifier: name },
      ),
    );
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'family-member.deletion.confirmation.title',
          msg: msg,
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._uas
            .deleteFamilyMember(data.entry.patient, data.fm)
            .then((fam) => (data.entry.familyMembers = fam));
        }
      });
  }
  protected async disableCareTeam(entry: TableEntry) {
    const selectedPatient = entry.patient;
    const msg = await lastValueFrom(
      this._localeService.translateService.get('disable.care-team.msg', {
        identifier: selectedPatient?.getFullName(),
        org: selectedPatient!.managingOrganization?.name,
      }),
    );
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'disable.care-team.label',
          msg: msg,
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._uas
            .disableCareTeam(selectedPatient!)
            .then(() => this.selectedPatientCareteamActive(false, entry));
        }
      });
  }
  selectedPatientCareteamActive(arg0: boolean, entry: TableEntry): any {
    const newLocal = this.patientsList.find(
      (e) => e.patient.fhirId == entry.patient.fhirId,
    );
    if (newLocal) newLocal.dataVisible = arg0;
  }

  protected async enableCareTeam(entry: TableEntry) {
    const selectedPatient = entry.patient;
    const msg = await lastValueFrom(
      this._localeService.translateService.get('enable.care-team.msg', {
        identifier: selectedPatient?.getFullName(),
        org: selectedPatient!.managingOrganization?.name,
      }),
    );
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'enable.care-team.label',
          msg: msg,
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._uas
            .enableCareTeam(selectedPatient)
            .then(() => this.selectedPatientCareteamActive(true, entry));
        }
      });
  }
}
