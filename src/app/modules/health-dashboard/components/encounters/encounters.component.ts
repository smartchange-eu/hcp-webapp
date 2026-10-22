import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Encounter,
  EncounterStatus,
  EncounterType,
  HealthCareProfessional,
  Organization,
  Patient,
  Role,
} from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { PatientService } from '@modules/service/services/patient.service';
import { UserService } from '@modules/service/services/user.service';
import { NewEncounterDialogComponent } from '@modules/library/components/new-encounter-dialog/new-encounter-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-encounters',
  templateUrl: './encounters.component.html',
  styleUrls: ['./encounters.component.scss'],
})
export class EncountersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private debug = environment.debug;

  protected animationDisabled = false;
  protected path = '/web/hcp/dashboard/encounters';

  protected patient?: Patient;
  protected lang: string;
  protected hcp?: HealthCareProfessional;
  protected loading = true;
  protected oldEncounters?: Encounter[];

  protected errorMsg?: string;

  private DIALOG_WIDTH = '800px';

  public constructor(
    private _localeService: LocaleService,
    private _router: Router,
    private _snackBar: SnackBarService,
    private _dialog: MatDialog,
    private _databus: DataBusService,
    private _patientService: PatientService,
    private _userService: UserService,
    private r: ActivatedRoute,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    this._databus.currentEncounter = undefined; // reset dell'encounter selezionato
  }

  public async ngOnInit(): Promise<void> {
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this.patient = this._databus.currentPatient;
    this.hcp = this._databus.currentPractitioner;

    this._databus.encounterList$
      .pipe(takeUntil(this.destroy$))
      .subscribe((encs) => {
        this.oldEncounters = encs;
      });
    this._databus.patientDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ret) => {
        this.loading = !ret;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  public async reloadList(): Promise<void> {
    await this._patientService.loadEncounters(this.patient!);
  }

  // N.B.: SOLO HCP può creare il nuovo episodio
  // quando lo creerà l'infermiere sarà chiesto esplicitamente di selezionare il CareManager dall'elenco di tutti i medici dell'ospedale
  protected async newEncounter(): Promise<void> {
    let types = CodedValueConfig.encounterTypes;
    let orgs: Organization[] = [];
    if (this.patient?.managingOrganization) {
      orgs = [this.patient?.managingOrganization];
    } else {
      orgs = this._databus.hcpOrganizations;
    }
    if (
      this.oldEncounters?.find((e) => e.type == EncounterType.FIRST_ENCOUNTER)
    ) {
      types = types.filter((t) => t.code != EncounterType.FIRST_ENCOUNTER);
    }
    // open the dialog
    this._dialog
      .open(NewEncounterDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'new-encounter-dialog.type.select.title',
          msg: 'new-encounter-dialog.type.select.msg',
          closeLabel: 'not.ok.label',
          okLabel: 'ok.label',
          orgs: orgs,
          types: types,
        },
      })
      .afterClosed()
      // tslint:disable-next-line: deprecation
      .subscribe((enc) => {
        if (enc) {
          enc.patient = this.patient;
          enc.participant = this.hcp;
          enc.startDate = new Date();
          // invoca il connector per lo storage
          this._patientService
            .addEncounter(enc)
            .then(async (e) => {
              // if OK - vai alla pagina dell'episodio
              // metti l'episodio in sessione nel bus
              this._databus.currentEncounter = e;

              // vai alla pagina dell'episodio
              const navigated = await this._router.navigate(['../encounter'], {
                relativeTo: this.r,
              });
              if (!navigated) {
                const msgKey =
                  'hcp.patient-dashboard.new-encounter.success.snack';
                const msg =
                  this._localeService.translateService.instant(msgKey);
                this._snackBar.openSnackBar(msg);
              }
            })
            .catch((err: Error) => {
              //snackbar e non muoverti dalla pagina
              if (this.debug) {
                console.error(err);
              }

              const msg = 'hcp.patient-dashboard.new-encounter.error.snack';
              this._snackBar.openSnackBar(msg, undefined, 4000, 'snack-error');
            });
        }
      });
  }

  // SOLO Medico+Infermiere può creare episodio, e solo se non c'è un altro episodio aperto
  protected canCreateEncounter(): boolean {
    if (environment.enableAuthentication) {
      const alreadyOpened = this.hasPatientOpenedEncounter();

      const result =
        this._userService.checkRoles([Role.PRACTITIONER, Role.NURSE]) &&
        !alreadyOpened;

      return result;
    } else {
      return true;
    }
  }

  private hasPatientOpenedEncounter(): boolean {
    if (environment.enableAuthentication) {
      // FIXME: until the encounter list has been loaded (!= undefined) the button must be disabled
      const result =
        this.oldEncounters != undefined &&
        this.oldEncounters.find(
          (e) => e.status == EncounterStatus.INPROGRESS,
        ) != undefined;

      return result;
    } else {
      return false;
    }
  }

  protected encounterSelected(en: Encounter) {
    this._databus.currentEncounter = en;
    this._router
      .navigate(['../encounter'], { relativeTo: this.r })
      .then((navigated: boolean) => {
        if (en.status == EncounterStatus.COMPLETED) {
          const msgKey = 'patient-dashboard.encounters.read-only';

          const msg = this._localeService.translateService.instant(msgKey);

          this._snackBar.openSnackBar(msg, undefined, 4000, 'snack');
        }

        // if (!navigated) {
        //   this._snackBar.openSnackBar(
        //     'Espisodio selezionato non in sessione [MSG TO CHANGE]'
        //   );
        // }
      })
      .catch((err) => {
        //snackbar e non muoverti dalla pagina
        this._snackBar.openSnackBar(err, undefined, 4000, 'snack-error');
      });
  }
}
