import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import {
  Appointment,
  AppointmentStatus,
  HealthCareProfessional,
  Patient,
} from '@eng-it4h/heart-ui-model';
import { ConfirmationDialogComponent } from '@eng-it4h/heart-ui-utils';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { AppointmentsService } from '@modules/service/services/appointments.service';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { PatientService } from '@modules/service/services/patient.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'heart-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('drawer') public drawer?: MatDrawer;
  private DIALOG_WIDTH = '800px';

  protected appointments: Appointment[] = [];
  protected selectedAppointment?: Appointment;
  public patientsList: Patient[] = [];
  private hcp?: HealthCareProfessional;
  private currentPatient?: Patient;
  protected lang: string;
  public loading: boolean = false;
  public opened: boolean = false;
  protected appoitmentTypes;
  constructor(
    private _localeService: LocaleService,
    private _databus: DataBusService,
    private _patientService: PatientService,
    private _as: AppointmentsService,
    private dialog: MatDialog
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    this.appoitmentTypes = CodedValueConfig.encounterTypes;
  }

  public ngOnInit(): void {
    this.loading = true;
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this.hcp = this._databus.currentPractitioner;
    this.currentPatient = this._databus.currentPatient;
    // load all the encounters of the selected patient
    this._databus.trialList$.pipe(takeUntil(this.destroy$)).subscribe((pl) => {
      this.patientsList = pl.map((t) => t.patient);
    });

    this._databus.appointmmentList$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pl) => {
        this.appointments = pl;
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

  public async onSave(appt: Appointment): Promise<void> {
    this.drawer?.close();
    if (appt !== undefined) {
      this.loading = true;
      appt.participant = this.hcp;
      this._as.addAppointment(appt).then(() => (this.loading = false));
    }
  }

  onDeleteAppointment(appointment: Appointment): void {
    console.log('Delete:', appointment);
    // TODO: Add logic to open an edit form.
    this.appointments = this.appointments.filter((a) => a !== appointment);
  }

  onConfirmAppointment(appointment: Appointment): void {
    appointment.status = AppointmentStatus.BOOKED;
    this._as.changeAppointment(appointment);
  }

  public async onOpenAppointment(appointment: Appointment): Promise<void> {
    if (this.currentPatient === undefined)
      this.doOpenDashboard(appointment.patient);
    else if (this.currentPatient?.id === appointment.patient?.id) {
      this.doOpenDashboard();
    } else {
      const msg = await lastValueFrom(
        this._localeService.translateService.get(
          'user.deselect.confirmation.msg',
          { identifier: this.currentPatient?.getFullName() }
        )
      );
      this.dialog
        .open(ConfirmationDialogComponent, {
          width: this.DIALOG_WIDTH,
          data: {
            title: 'user.switch.confirmation.title',
            msg: msg,
            closeLabel: 'answer.no.label',
            okLabel: 'answer.yes.label',
          },
        })
        .afterClosed()
        .subscribe((res) => {
          if (res == true) {
            this.doOpenDashboard(appointment.patient);
          }
        });
    }
  }

  private doOpenDashboard(pat?: Patient) {
    if (pat) {
      this._patientService.switchCurrentPatient(pat, true);
    }
  }
}
