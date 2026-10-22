import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Organization, User } from '@eng-it4h/heart-ui-model';
import {
  ConfirmationDialogComponent,
  SnackBarService,
} from '@eng-it4h/heart-ui-utils';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { LocaleService } from '@modules/service/services/locale.service';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';

@Component({
  selector: 'app-list-practitioners',
  templateUrl: './list-practitioners.component.html',
  styleUrls: ['./list-practitioners.component.scss'],
})
export class ListPractitionersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public hcpUsers: User[] = [];
  public organizations: Organization[] = [];
  public lang: string;
  public loading: boolean = false;
  private DIALOG_WIDTH = '800px';

  // prettier-ignore
  public constructor(
      private dialog: MatDialog,
      private localeService : LocaleService,
      private _databus: DataBusService,
      private _snackBar: SnackBarService,
      private _uas: UserAdministrationService
  ) {
      this.lang = localeService.currentLanguage.toString();
     
  }
  public async reloadList(): Promise<void> {
    await this._uas.reloadAdministrativeData();
  }

  public ngOnInit(): void {
    this.loading = true;
    this.localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this._databus.allOrganizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pl) => {
        this.organizations = pl;
        this.loadData()
          .then(() => {
            // const currentUser = this.databus.getCurrentUser()?.username;
            // this.hcpUsers = this.hcpUsers?.filter((hcp) => {
            //   hcp.username != currentUser;
            // });
          })
          .catch((err) => {
            console.log(`Error: could not load HCPs ` + err);
            this.hcpUsers = [];
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

  public selectedUser(user: User) {
    if (environment.debug) {
      console.log('selected ' + user.person.fhirId);
    }
  }

  private async loadData() {
    const users: User[] = await this._uas.loadUsers('HealthCareProfessional');

    users.forEach((user) =>
      user.person.personRoles.forEach((role) => {
        const org = this.organizations.find(
          (o) => role.organization.id === o.id,
        );
        role.organization = org ? org : role.organization;
      }),
    );
    this.hcpUsers = users ? users : [];
    return;
  }

  public async openEnableUserDialog(event: {
    user: User;
    enable: boolean;
  }): Promise<void> {
    const user = event.user;
    if (event.enable) {
      this._uas.enableUser(user);
    } else if (this._uas.isSelf(user)) {
      // TODO: discuss warning type
      this.openSuccessSB('admin.user.disable.error'); // 'green'
    } else {
      const msg = await lastValueFrom(
        this.localeService.translateService.get(
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
            this._uas.disableUser(user);
          }
        });
    }
  }
  public async openDeleteUserDialog(user: User): Promise<void> {
    if (this._uas.isSelf(user)) {
      // TODO: discuss warning type
      this.openErrorSB('admin.user.self.error');
    } else {
      // open the dialog only while disabling the credentials
      const msg = await lastValueFrom(
        this.localeService.translateService.get(
          'user.deletion.confirmation.msg',
          { identifier: user.username },
        ),
      );
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
            this._uas
              .deletePractitioner(user)
              .then(() => {
                this.hcpUsers = this.hcpUsers.filter((u) => {
                  return user.username !== u.username;
                });
              })
              .catch((err) => {
                console.log('Error: could not delete user ' + err);
              });
          }
        });
    }
  }

  private openSuccessSB(msg: string) {
    this._snackBar.openSnackBar(msg, undefined, 4000, 'snack-success'); // 'green'
  }

  private openErrorSB(msg: string) {
    this._snackBar.openSnackBar(msg, undefined, 4000, 'snack-error');
  }
}
