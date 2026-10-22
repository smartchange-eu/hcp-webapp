import { format, sub } from 'date-fns';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  GenericQuantitativeMeasure,
  Identifier,
  Patient,
} from '@eng-it4h/heart-ui-model';
import { Identifier as FI } from '@eng-it4h/fhir-r5';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import {
  DefaultService,
  ForwardParentConsentRequest,
} from '@modules/slofit-emr-api/openapi';
import { catchError, throwError } from 'rxjs';
export type SlofitData = {
  email?: string;
  parent_name?: string;
  dob?: Date;
  kidName?: string;
};

@Injectable({
  providedIn: 'root',
})
export class SlofitDataService {
  public readonly slofit_system?: string;

  public readonly TEMP = FI.IdentifierUse.TEMP.toString();
  public readonly SECONDARY = FI.IdentifierUse.SECONDARY.toString();
  public readonly OLD = FI.IdentifierUse.OLD.toString();

  private readonly SLOFIT_ANNOTATION = 'slofit';

  constructor(
    private _backendService: HeartUiConnectorService,
    private _slofit: DefaultService,
    private _snackBar: SnackBarService,
  ) {
    this.slofit_system =
      environment.slofitPidSystem && environment.slofitPidSystem.length > 0
        ? environment.slofitPidSystem
        : undefined;
  }

  public async registerSlofitUser(p: Patient, fm: SlofitData) {
    if (!this.slofit_system) return;
    let pid = this.getPid(p);
    if (pid == undefined) {
      try {
        pid = await this.addRandomIdentifier(p);
      } catch (err) {
        throw new Error('no pid available or error creating it');
      }
    }
    if (!fm.email || !fm.parent_name) {
      throw new Error('no parent details available');
    }

    const req: ForwardParentConsentRequest = {
      parent_email: fm.email,
      parent_name: fm.parent_name,
      'smartchange-pid': pid.value,
      student_name: fm.kidName ?? p.getFullName(),
    };
    if (fm.dob) {
      req.student_dob = format(fm.dob, 'yyyy-MM-dd');
    }

    this.updateParentPid$(req)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          let msg = 'internal error. Please contact the technical support';
          switch (err.status) {
            case 400:
            case 401:
            case 500:
              // bad request
              break;
            case 402:
            case 403:
              msg = err.error.message;
              break;
          }
          this.confirmConnected(p, pid!.value, false).then(() => {
            this._snackBar.openSnackBar(msg, undefined, 5000, 'snack-error');
          });
          return throwError(() => err);
        }),
      )
      .subscribe((res) => {
        this.confirmConnected(p, pid!.value).then(() =>
          this._snackBar.openSnackBar(
            'hcp.physical-examination.add.success.snack',
            undefined,
            4000,
            'snack-success',
          ),
        );
      });
  }

  public get enabled() {
    return this.slofit_system != undefined;
  }

  public connected(p: Patient) {
    return this.getPid(p, this.SECONDARY) != undefined;
  }
  public async getSlofitData(patient: Patient) {
    if (this.getPid(patient, this.SECONDARY) == undefined) {
      return [];
    }
    try {
      const meas =
        ((await this._backendService.measureConnector.searchByPatientAndType(
          patient,
          CodedValueConfig.slofitCodes,
          undefined,
          undefined,
          true,
          true,
        )) as GenericQuantitativeMeasure[]) ?? [];
      return (
        meas
          .filter((m) => m.notes && m.notes == this.SLOFIT_ANNOTATION)
          ?.sort((a, b) => {
            return b.assertedWhen.getTime() - a.assertedWhen.getTime();
          }) ?? []
      );
    } catch (err) {
      console.log(`Error retrieving Slofit measures for patient ${patient}`);
      return [];
    }
  }

  private async addRandomIdentifier(p: Patient): Promise<Identifier> {
    if (!this.slofit_system) throw new Error('no system available');
    const slofitId = new Identifier();
    slofitId.system = this.slofit_system;
    slofitId.value = self.crypto.randomUUID();
    slofitId.use = this.TEMP;
    p.additionalIdentifiers.push(slofitId);
    await this._backendService.patientConnector.update(p);
    return slofitId;
  }

  private async confirmConnected(
    p: Patient,
    pid: string,
    success = true,
  ): Promise<void> {
    if (!this.slofit_system) throw new Error('no system available');
    const slofitId = this.getPid(p, undefined, pid);
    if (slofitId) {
      if (success == false && slofitId.use == this.OLD) return;
      slofitId.use = success ? this.SECONDARY : this.OLD;
      // TODO: check it changed in patient identifier
      await this._backendService.patientConnector.update(p);
    }
  }

  private updateParentPid$(req: ForwardParentConsentRequest) {
    return this._slofit.forwardParentConsent(req, 'response');
  }

  private getPid(patient: Patient, use?: string, value?: string) {
    return patient.additionalIdentifiers.find((id) => {
      if (use && value) {
        return (
          id.system === this.slofit_system &&
          id.use === use &&
          id.value === value
        );
      } else if (use) {
        return id.system === this.slofit_system && id.use === use;
      } else if (value) {
        return id.system === this.slofit_system && id.value === value;
      } else {
        return id.system === this.slofit_system;
      }
    });
  }
}
