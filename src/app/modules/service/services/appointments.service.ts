import { Injectable } from '@angular/core';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import { Appointment } from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { DataBusService } from './data-bus.service';
@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private debug = environment.debug || false;

  constructor(
    private _backendService: HeartUiConnectorService,
    private _dataBus: DataBusService,
    private _snackbar: SnackBarService
  ) {}

  public async loadAppointments(forceReload: boolean = false): Promise<void> {
    const appts: Appointment[] =
      (await this._backendService.appointmentConnector.searchAppointmentsByHCP(
        this._dataBus.currentPractitioner,
        forceReload
      )) ?? [];
    appts.forEach(
      (a) =>
        (a.patient = this._dataBus.patientsList.find(
          (p) => p.id == a.patient?.id
        ))
    );
    this._dataBus.appointmmentList = appts;
  }

  public async addAppointment(a: Appointment) {
    try {
      const newA = await this._backendService.appointmentConnector.create(a);
      if (environment.debug) {
        console.log('saved with ID ' + newA?.fhirId);
      }
      this._snackbar.openSnackBar('appointments.save.success.msg');
      this._dataBus.appointmmentList = [
        ...this._dataBus.appointmmentList,
        newA,
      ];
    } catch (error) {
      if (this.debug) console.error(`Error: ` + error);
      this._snackbar.openSnackBar(
        'appointments.saving.error.msg',
        undefined,
        4000,
        'snack-error'
      );
    }
  }

  public async changeAppointment(appointment: Appointment) {
    this._backendService.appointmentConnector
      .update(appointment)
      .then(() =>
        this._snackbar.openSnackBar('appointments.confirm.success.msg')
      )
      .catch(() =>
        this._snackbar.openSnackBar(
          'appointments.delete.error.msg',
          undefined,
          4000,
          'snack-error'
        )
      )
      .finally(() => this.loadAppointments());
  }
}
