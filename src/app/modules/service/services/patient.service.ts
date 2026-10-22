import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  Patient,
  Plan,
  TrialSubject,
  GenericQuantitativeMeasure,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from './data-bus.service';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { sub } from 'date-fns';
import { LogEvent } from './logging.decorator';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private debug = environment.debug;

  constructor(
    private _dataBus: DataBusService,
    private _router: Router,
    private backendClient: HeartUiConnectorService
  ) {
    this.init();
  }

  /*********************
   * Session Patient
   *********************/
  @LogEvent(USER_EVENT_CONSTANTS.USER_DESELECTED_PATIENT)
  public deselectPatient(): void {
    this._dataBus.currentPatient = undefined;
    this.navigateToNext();
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_SELECTED_PATIENT)
  public switchCurrentPatient(
    pat: Patient,
    navigateHome: boolean = true
  ): void {
    this._dataBus.currentPatient = undefined;
    if (pat.id) {
      this._dataBus.currentPatient = pat;
      if (navigateHome) this.navigateToNext();
      return;
    }
    throw new Error('Patient has no ID');
  }

  public async init(): Promise<void> {
    this._dataBus.currentPatient$.subscribe((patient) => {
      this.doLoadData(patient);
    });
  }

  public reload() {
    const patient = this._dataBus.currentPatient;
    this.doLoadData(patient);
  }

  private async doLoadData(patient?: Patient) {
    if (patient) {
      Promise.all([
        this.loadActivePlanIfExists(patient, true),
        this.loadEncounters(patient, true),
        this.loadFamily(patient, true),
        this.loadRisk(patient, true),
        this.loadPilotGroup(patient, true),
        this.getMeasures(patient),
        this.getNutrition(patient),
      ])
        .then(() => {
          if (this.debug) console.log(`Info: patient data loaded`);
        })
        .catch((err) => {
          if (this.debug) console.error(`Error: ` + err);
        })
        .finally(() => {
          this._dataBus.patientDataReady = true;
        });
    } else {
      // reset
      this._dataBus.patientDataReady = false;
      this._dataBus.currentPlan = undefined;
      this._dataBus.currentEncounter = undefined;
      this._dataBus.encounterList = [];
      this._dataBus.family = [];
      this._dataBus.measures = [];
      this._dataBus.nutrition = [];
      this._dataBus.currentRisks = [];
      this._dataBus.initialRisk = undefined;
      this._dataBus.currentGroup = undefined;
    }
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_STARTED_ENCOUNTER)
  public async addEncounter(enc: any) {
    const e = await this.backendClient.encounterConnector.create(enc);
    this._dataBus.encounterList = [...this._dataBus.encounterList, e];
    return e;
  }

  public async loadActivePlanIfExists(
    patient: Patient,
    forceReload: boolean = false
  ): Promise<boolean> {
    try {
      const plans: Plan[] =
        await this.backendClient.carePlanConnector.searchByPatient(
          patient,
          Plan.PlanStatus.ACTIVE
        );

      if (plans?.length > 0 && plans[0]) {
        this._dataBus.currentPlan = plans[0];
        return Promise.resolve(true);
      }
      console.log(`No plans for patient ${patient?.getFullName()}`);
      return Promise.resolve(false);
    } catch (err) {
      console.log(`Error retrieving plans for patient ${patient.fhirId}`);
      return Promise.reject();
    }
  }

  public async loadEncounters(
    patient: Patient,
    forceReload: boolean = false
  ): Promise<void> {
    try {
      const encounterList =
        (await this.backendClient.encounterConnector.searchEncountersByPatient(
          patient,
          forceReload
        )) ?? [];
      this._dataBus.encounterList = encounterList;
    } catch (err) {
      console.log(`Error retrieving encounters for patient ${patient}`);
      this._dataBus.encounterList = [];
      return Promise.reject();
    }
  }

  private async loadFamily(
    patient: Patient,
    forceReload: boolean = false
  ): Promise<void> {
    try {
      this._dataBus.family =
        (await this.backendClient.relatedPerson.searcByPatient(
          patient,
          forceReload
        )) ?? [];
    } catch (err) {
      console.log(
        `Error retrieving family members for patient ${this._dataBus
          .currentPatient!}`
      );
      this._dataBus.family = [];
      return Promise.reject();
    }
  }

  private async loadPilotGroup(
    patient: Patient,
    forceReload: boolean = false
  ): Promise<void> {
    try {
      this._dataBus.currentGroup = (
        await this.backendClient.trialConnector.getTrialByPatient(
          patient,
          CodedValueConfig.studyName
        )
      )?.find((c: TrialSubject) => c.patient.id == patient.id);
    } catch (err) {
      console.log(`Error retrieving trialGroup for patient ${patient}`);
      this._dataBus.currentGroup = undefined;
      return Promise.reject();
    }
  }

  private async loadRisk(
    patient: Patient,
    forceReload: boolean = false
  ): Promise<void> {
    try {
      const risks =
        (await this.backendClient.riskConnector.searchLatestByPatient(
          patient
        )) ?? [];
      risks.sort((a, b) => b.date.getTime() - a.date.getTime());
      this._dataBus.initialRisk = risks.find((ir) =>
        ir.predictions.some(
          (p) =>
            p.code.uniqueLabelKey ===
            CodedValueConfig.initialRiskCode.uniqueLabelKey
        )
      );
      this._dataBus.currentRisks =
        risks.filter(
          (r) =>
            !r.predictions.some(
              (p) =>
                p.code.uniqueLabelKey ===
                CodedValueConfig.initialRiskCode.uniqueLabelKey
            )
        ) ?? [];
    } catch (err) {
      console.log(`Error retrieving risk for patient ${patient}`);
      this._dataBus.currentRisks = [];
      this._dataBus.initialRisk = undefined;
      return Promise.reject();
    }
  }

  private async getNutrition(
    patient: Patient,
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    try {
      if (startDate && !endDate) {
        endDate = new Date();
      }
      const meas =
        (await this.backendClient.nutritionConnector.searchByPatient(
          patient
        )) ?? [];
      this._dataBus.nutrition = meas.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
      });
    } catch (err) {
      this._dataBus.nutrition = [];
      console.log(`Error retrieving measures for patient ${patient}`);
      return Promise.reject();
    }
  }

  private async getMeasures(patient: Patient): Promise<void> {
    try {
      const endDate = new Date();
      const startDate = sub(endDate, {
        months: 1,
      });
      const meas =
        ((await this.backendClient.measureConnector.searchByPatientAndType(
          patient,
          CodedValueConfig.historyCodes,
          { from: startDate, to: endDate },
          undefined,
          true,
          true
        )) as GenericQuantitativeMeasure[]) ?? [];
      this._dataBus.measures = meas.sort((a, b) => {
        return b.assertedWhen.getTime() - a.assertedWhen.getTime();
      });
    } catch (err) {
      this._dataBus.measures = [];
      console.log(`Error retrieving measures for patient ${patient}`);
      return Promise.reject();
    }
  }
  private navigateToNext(): void {
    this._router.navigateByUrl('/web/');
  }
}
