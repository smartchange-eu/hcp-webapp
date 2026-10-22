import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Organization } from '@eng-it4h/heart-ui-model';
import {
  ConfirmationDialogComponent,
  SnackBarService,
} from '@eng-it4h/heart-ui-utils';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { AddOrganizationDialogComponent } from '@modules/library/components/add-organization-dialog/add-organization-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-manage-orgs',
  templateUrl: './manage-orgs.component.html',
  styleUrls: ['./manage-orgs.component.scss'],
})
export class ManageOrgsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public organizations: Organization[] = [];
  public lang: string;
  public loading: boolean = false;
  private DIALOG_WIDTH = '800px';

  //data table
  displayedColumns: string[] = ['name', 'actions'];
  dataSource: Organization[] = [];

  // prettier-ignore
  public constructor(
        private dialog: MatDialog,
        private localeService : LocaleService,
        private _snackBar: SnackBarService,
        private _pms: UserAdministrationService,
        private _databus: DataBusService
    ) {
        this.lang = localeService.currentLanguage.toString();
    }

  public ngOnInit(): void {
    this.loading = true;
    this.localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    // load all the encounters of the selected patient
    this._databus.allOrganizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pl) => {
        this.organizations = pl;
        this.prepareDataTable(this.organizations);
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

  private prepareDataTable(s: Organization[]): void {
    this.dataSource = s ?? [];
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddOrganizationDialogComponent, {
      width: this.DIALOG_WIDTH,
      data: { name: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        const newOrganization = new Organization(undefined, result);
        this._pms.addOrganization(newOrganization).then(() => {
          this.loading = false;
        });
      }
    });
  }

  public doEditOrg(row: Organization) {
    const dialogRef = this.dialog.open(AddOrganizationDialogComponent, {
      width: this.DIALOG_WIDTH,
      data: { name: row.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        row.name = result;
        this._pms.editOrganization(row).then(() => {
          this.loading = false;
        });
      }
    });
  }

  public doDeleteOrg(row: Organization) {
    // open the dialog only while disabling the credentials
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'org.delete.confirmation.title',
          msg: 'org.delete.confirmation.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      // tslint:disable-next-line: deprecation
      .subscribe((res) => {
        if (res == true) {
          console.log('delete org', row);
          // TODO: add delete org action and confirm dialog
        }
      });
  }
}
