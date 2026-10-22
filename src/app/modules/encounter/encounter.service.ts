import { FhirUtils } from '@eng-it4h/heart-ui-converter';
import { Injectable } from '@angular/core';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  Answer,
  AnswerGroup,
  ClinicalNote,
  Diagnosis,
  Encounter,
  EncounterQuestionnaire,
  EncounterStatus,
  GenericQuantitativeMeasure,
  HealthCareProfessional,
  Measure,
  CodedValue,
  Patient,
  Questionnaire,
  QuestionnaireResponse,
  Role,
} from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserService } from '@modules/service/services/user.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { PatientService } from '@modules/service/services/patient.service';
import { SuggestionService } from '@modules/service/services/suggestion.service';
import { CommonChartConf } from '@config/charts.conf';
import { LabUnitConversionService } from '@modules/service/services/lab-unit-conversion.service';
import { LogEvent } from '@modules/service/services/logging.decorator';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';
import { UserEventsLogService } from '@modules/service/services/user-events-log.service';

@Injectable({
  providedIn: 'root',
})
export class EncounterService {
  private debug = environment.debug || true;

  public currentEncounter?: Encounter;

  public currentCompleteEncounterSubject: BehaviorSubject<
    Encounter | undefined
  > = new BehaviorSubject<Encounter | undefined>(undefined);

  constructor(
    private _userService: UserService,
    private _dataBusService: DataBusService,
    private _backendService: HeartUiConnectorService,
    private _labUnitConv: LabUnitConversionService,
    private _snackBar: SnackBarService,
    private _localeService: LocaleService,
    private _patientService: PatientService,
    private _eventLog: UserEventsLogService,
    private _suggestionService?: SuggestionService
  ) {
    this._dataBusService.currentEncounter$.subscribe((e) => {
      if (e?.startDate) {
        this.setEncounter(e);
      } else {
        this.currentEncounter = undefined;
      }
    });
  }

  private async setEncounter(e: Encounter) {
    // arricchisce l'episodio selezionato con tutti gli encounters - se la vede il connector
    const completeE =
      await this._backendService.encounterConnector.enrichEncounter(e);
    if (completeE) {
      this.currentEncounter = this.toDisplayEncounter(completeE);
      this.currentCompleteEncounterSubject.next(this.currentEncounter);
    } else {
      this.currentEncounter = e; // quello che viene dal BUS
    }
  }

  public getCurrentPatient() {
    return this._dataBusService.currentPatient!;
  }
  // gestione fine dei permessi
  // solo il practitioner può chiudere l'episodio
  public canCloseEncounter(): boolean {
    return this.hasPermission([Role.PRACTITIONER, Role.NURSE]);
  }

  // gestione fine dei permessi
  // solo il practitioner può chiudere l'episodio
  @LogEvent(USER_EVENT_CONSTANTS.USER_COMPLETED_ENCOUNTER)
  public async doCloseEncounter(): Promise<void> {
    if (this.currentEncounter) {
      this.currentEncounter.closingDate = new Date();
      await this._backendService.encounterConnector.update(
        this.toPersistEncounter(this.currentEncounter)
      );
      this._patientService.loadEncounters(this.getCurrentPatient()!, true);
      this._suggestionService?.updateRiskSuggestions();
    }
  }

  // gestione fine dei permessi
  public hasPermission(r: Role[]) {
    if (environment.enableAuthentication) {
      return this._userService.checkRoles(r);
    }
    return true;
  }

  getNotes(episode: Encounter): ClinicalNote {
    let oldNotes = episode.notes;
    if (oldNotes) {
      return (
        oldNotes.find(
          (n) => n.author?.id === this._dataBusService.currentPractitioner?.id
        ) ?? new ClinicalNote()
      );
    }
    return new ClinicalNote();
  }

  public isEditable(episode?: Encounter) {
    if (episode) {
      return episode.status == EncounterStatus.INPROGRESS;
    }
    return this.currentEncounter?.status == EncounterStatus.INPROGRESS;
  }

  public async updateEncounter(): Promise<void> {
    return this._backendService.encounterConnector
      .update(this.toPersistEncounter(this.currentEncounter!))
      .then((res) =>
        this.currentCompleteEncounterSubject.next(this.currentEncounter!)
      );
  }

  public async setPhysiological(qr: QuestionnaireResponse): Promise<void> {
    this.currentEncounter!.setQuestionnaire(
      EncounterQuestionnaire.PATIENT_PHYSIOLOGICAL_HISTORY,
      qr
    );
    return this.mergeEncountersAndUpdateEpisode(qr);
  }

  public async setRemote(qr: QuestionnaireResponse): Promise<void> {
    this.currentEncounter!.setQuestionnaire(
      EncounterQuestionnaire.REMOTE_ANAMNESIS,
      qr
    );
    return this.mergeEncountersAndUpdateEpisode(qr);
  }

  public async setProx(qr: QuestionnaireResponse): Promise<void> {
    this.currentEncounter!.setQuestionnaire(
      EncounterQuestionnaire.PATIENT_SHORT_TERM_HISTORY,
      qr
    );
    return this.mergeEncountersAndUpdateEpisode(qr);
  }

  public async searchQuestionnaireByRef(qref: Questionnaire) {
    return await this._backendService.questionnaireConnector.searchByReference(
      qref,
      undefined,
      false
    );
  }

  public async setQuestionnaire(
    qr: QuestionnaireResponse,
    type: EncounterQuestionnaire
  ): Promise<void> {
    // 0. set the QuestionnaireResponse author
    const practitioner = this._dataBusService.currentPractitioner;
    qr.author = practitioner;
    const patient = this._dataBusService.currentPatient;
    qr.subject = patient!;
    qr = this.addDerivedAnswer(qr);
    this.currentEncounter!.setQuestionnaire(type, qr);
    return this.mergeEncountersAndUpdateEpisode(qr);
  }

  public async addDiagnosis(diagnosis: Diagnosis): Promise<Diagnosis[]> {
    if (diagnosis.id == undefined) {
      if (this.currentEncounter!.diagnosis == undefined) {
        this.currentEncounter!.diagnosis = [];
      }

      this.currentEncounter!.diagnosis.push(diagnosis);
    }

    await this.mergeEncountersAndUpdateEpisode(undefined, diagnosis);

    return this.currentEncounter!.diagnosis || [];
  }

  public async saveNote(episodeNotes: ClinicalNote) {
    const hcp = this._dataBusService.currentPractitioner;
    if (episodeNotes.id == undefined) {
      if (this.currentEncounter!.notes == undefined) {
        this.currentEncounter!.notes = [];
      }
      const idx = this.currentEncounter!.notes.findIndex(
        (n) => n.author.id === hcp.id
      );
      if (idx === -1) {
        episodeNotes.author = hcp;
        episodeNotes.patient = this._dataBusService.currentPatient!;
        this.currentEncounter!.notes.push(episodeNotes);
      } else {
        this.currentEncounter!.notes[idx] = episodeNotes;
      }
    }
    await this.mergeEncountersAndUpdateEpisode(
      undefined,
      undefined,
      undefined,
      episodeNotes
    );
    return this.currentEncounter!.notes || [];
  }

  public getQuestionnaireURL(eq: EncounterQuestionnaire): string | undefined {
    return FhirUtils.fromDataModelEncounterQuestionnaire(eq);
  }

  public async addMeasures(meas: Measure[]): Promise<Measure[]> {
    const now = new Date();
    meas.forEach((m) => {
      if (!m.assertedWhen) m.assertedWhen = now;
      if (m.id == undefined) {
        if (this.currentEncounter!.physical_examination == undefined) {
          this.currentEncounter!.physical_examination = [];
        }
        this.currentEncounter!.physical_examination.push(m);
      }
    });
    // 1. dovrebbero esserci tutte le misurazioni
    await this.mergeEncountersAndUpdateEpisode(undefined, undefined, meas);

    return this.currentEncounter!.physical_examination || [];
  }

  // da invocare solo quando effettivamente si aggiungono informazioni all'encounter, altrimenti non viene salvato nulla
  private async mergeEncountersAndUpdateEpisode(
    qr?: QuestionnaireResponse,
    diagnosis?: Diagnosis,
    physicalExamination?: Measure[],
    note?: ClinicalNote
  ): Promise<void> {
    const hcp = this._dataBusService.currentPractitioner;
    if (this.currentEncounter && hcp) {
      // return this._backendService.episodeConnector.update(this.currentEpisode!);
      // FIXME: se l'encounter non ha ID, deve essere salvato
      await this._backendService.encounterConnector.update(
        this.toPersistEncounter(this.currentEncounter)
      );
      this.toDisplayEncounter(this.currentEncounter);
      let res:
        | QuestionnaireResponse
        | Diagnosis
        | void
        | Measure[]
        | ClinicalNote = undefined;
      if (qr && !diagnosis) {
        this._eventLog.logEvent(USER_EVENT_CONSTANTS.USER_RECORDED_DATA, {
          type: 'Questionnaire',
        });
        res = await this.saveQuestionnaireResponse(
          qr,
          hcp,
          this.currentEncounter
        );
      } else if (diagnosis) {
        res = await this.saveDiagnosis(diagnosis, hcp, this.currentEncounter);
      } else if (physicalExamination) {
        this._eventLog.logEvent(USER_EVENT_CONSTANTS.USER_RECORDED_DATA, {
          type: 'Measures',
        });

        res = await this.savePhysicalExamination(
          physicalExamination,
          hcp,
          this.currentEncounter
        );
      } else if (note) {
        this._eventLog.logEvent(USER_EVENT_CONSTANTS.USER_RECORDED_DATA, {
          type: 'Note',
        });

        res = await this.saveClinicalNote(note, hcp, this.currentEncounter);
      }
      this._patientService.loadEncounters(this.getCurrentPatient(), true);
      if (res) {
        if (res instanceof QuestionnaireResponse) {
          qr!.id = res.id;
        } else if (res instanceof Diagnosis) {
          diagnosis!.id = res.id;
        } else if (res instanceof ClinicalNote) {
          note!.id = res.id;
        } else if (this.isArrayOf(res, GenericQuantitativeMeasure)) {
          // setto l'id Che mi arriva dal server
          //TODO: devo triggerare qualche hook?
          res.forEach((r) => {
            let lookingFor = r.cvType?.uniqueLabelKey;
            let meas = physicalExamination?.find((m) => {
              if (m instanceof GenericQuantitativeMeasure) {
                return m.cvType?.uniqueLabelKey == lookingFor;
              }
              return false;
            });
            if (meas) {
              meas.id = r.id;
            }
          });
        }
      }
      this.sendCurrentCompleteEncounter(this.currentEncounter!);
    } else {
      return Promise.reject(
        'No encounter in session in order to add the attribute'
      );
    }
  }

  async saveQuestionnaireResponse(
    qr: QuestionnaireResponse,
    author: HealthCareProfessional,
    currentEncounter: Encounter | undefined
  ): Promise<void | QuestionnaireResponse> {
    // qui il currentEncounter deve esistere, occorre l'id per poterlo inserire nel questionnaireResponse da salvare
    if (this.debug) {
      console.log(
        `[DEBUG] EncounterID: ${currentEncounter?.id} and QuestionnaireResponseID: ${qr?.id}`
      );
    }
    if (qr && qr.id) {
      await this._backendService.questionnaireConnector.updateResponse(
        qr,
        author,
        currentEncounter
      );
      // computing measures from questionnaire response
    } else {
      return await this._backendService.questionnaireConnector.createResponse(
        qr,
        author,
        currentEncounter
      );
    }
  }

  private addDerivedAnswer(qr: QuestionnaireResponse): QuestionnaireResponse {
    if (
      qr.questionnaire.questionnaireId ==
      this.getQuestionnaireURL(EncounterQuestionnaire.LIFESTYLE)
    ) {
      const group = qr.answers.find(
        (g) => g.questionId == 'pa-status' && g instanceof AnswerGroup
      ) as AnswerGroup;

      const aLaps: Answer | undefined = group?.answers?.find(
        (a) => a.questionId == '20-m-srt-laps' && a instanceof Answer
      ) as Answer | undefined;

      if (aLaps && aLaps.value && typeof aLaps.value == 'number') {
        const speedValue = CommonChartConf.srtLapsToSpeed(aLaps.value);

        // there is an answer for laps. chech if there is an answer for speed to update, or create it
        let aSpeed: Answer | undefined = group?.answers?.find(
          (a) => a.questionId == '20-m-srt' && a instanceof Answer
        ) as Answer | undefined;
        if (aSpeed) {
          aSpeed.value = speedValue;
        } else {
          aSpeed = new Answer();
          aSpeed.value = speedValue;
          aSpeed.questionId = '20-m-srt';
          group.answers.push(aSpeed);
        }
      }
    }
    return qr;
  }

  async saveDiagnosis(
    diagnosis: Diagnosis,
    author: HealthCareProfessional,
    currentEncounter: Encounter | undefined
  ): Promise<void | Diagnosis> {
    // qui il currentEncounter deve esistere, occorre l'id per poterlo inserire nella diagnosi da salvare
    if (this.debug) {
      console.log(
        `[DEBUG] EncounterID: ${currentEncounter?.id} and ConditionID: ${diagnosis?.id}`
      );
    }
    if (diagnosis && diagnosis.id) {
      return (await this._backendService.conditionConnector.update(
        diagnosis,
        author,
        currentEncounter
      )) as Diagnosis;
    } else {
      return (await this._backendService.conditionConnector.create(
        diagnosis,
        author,
        currentEncounter
      )) as Diagnosis;
    }
  }

  async savePhysicalExamination(
    physicalExamination: Measure[],
    author: HealthCareProfessional,
    currentEncounter: Encounter | undefined
  ): Promise<void | Measure[]> {
    // qui il currentEncounter deve esistere, occorre l'id per poterlo inserire nella diagnosi da salvare
    if (this.debug) {
      console.log(
        `[DEBUG] EncounterID: ${currentEncounter?.id} and Measure Array Length: ${physicalExamination?.length}`
      );
    }
    const toSave =
      this._labUnitConv.convertMeasuresToStore(physicalExamination);
    const toShow = await this._backendService.measureConnector.create(
      toSave,
      author,
      currentEncounter,
      true
    );
    this._labUnitConv.convertMeasuresToUi(physicalExamination);
    return this._labUnitConv.convertMeasuresToUi(toShow);
  }

  async saveClinicalNote(
    cn: ClinicalNote,
    author: HealthCareProfessional,
    currentEncounter: Encounter | undefined
  ): Promise<void | ClinicalNote> {
    // qui il currentEncounter deve esistere, occorre l'id per poterlo inserire nel questionnaireResponse da salvare
    if (this.debug) {
      console.log(
        `[DEBUG] EncounterID: ${currentEncounter?.id} and ClinicalNoteID: ${cn?.id}`
      );
    }
    return await this._backendService.clinicalNoteConnector.save(
      author,
      cn,
      currentEncounter
    );
  }

  public async sendActiveEncounterIfExists(
    patient: Patient,
    forceReload: boolean = true
  ): Promise<boolean> {
    try {
      const episodes: Encounter[] =
        (await this._backendService.encounterConnector.searchEncountersByPatient(
          patient!,
          forceReload
        )) ?? [];

      const ep = episodes?.find((e) => e.status == EncounterStatus.INPROGRESS);
      if (ep) {
        this._dataBusService.currentEncounter = this.toDisplayEncounter(ep);
        return Promise.resolve(true);
      }
      const msgKey = 'episode.service.no-active-episodes.error.snack';
      const msg = this._localeService.translateService.instant(msgKey);
      this._snackBar.openSnackBar(msg, undefined, 6000, 'snack-error');
      console.log(`Error retrieving episodes for patient ${patient}`);
      return Promise.resolve(false);
    } catch (err) {
      const msgKey = 'hcp.patient-dashboard.search-episodes.error.snack';
      const msg = this._localeService.translateService.instant(msgKey);
      this._snackBar.openSnackBar(msg, undefined, 6000, 'snack-error');
      console.log(`Error retrieving episodes for patient ${patient}`);
      return Promise.reject();
    }
  }

  /*********************
   * Current Encounter
   *********************/
  public sendCurrentCompleteEncounter(completeE: Encounter): void {
    if (completeE) {
      this.currentCompleteEncounterSubject.next(completeE);
    } else {
      this.currentCompleteEncounterSubject.next(undefined); // tendenzialmente mai
    }
  }

  public observeCurrentCompleteEncounter(): Observable<Encounter | undefined> {
    return this.currentCompleteEncounterSubject.asObservable();
  }

  public getCurrentCompleteEncounter(): Encounter | undefined {
    return this.currentCompleteEncounterSubject.value;
  }

  // utils method
  private isArrayOf<T>(
    array: any[],
    cls: new (...args: any[]) => T
  ): array is T[] {
    for (let item of array) {
      if (item != null) return item instanceof cls;
    }
    return false;
  }

  public async searchByPatientAndType(
    types: CodedValue[],
    startDate?: Date,
    endDate?: Date
  ): Promise<Measure[]> {
    const patient = this.getCurrentPatient();

    const meas =
      await this._backendService.measureConnector.searchByPatientAndType(
        patient!,
        types,
        startDate && endDate ? { from: startDate, to: endDate } : undefined,
        undefined,
        undefined,
        true
      );
    return this._labUnitConv.convertMeasuresToUi(meas);
  }

  private toDisplayEncounter(encounter: Encounter): Encounter {
    const arr = encounter?.physical_examination;
    if (!Array.isArray(arr) || arr.length === 0) return encounter;
    encounter.physical_examination = this._labUnitConv.convertMeasuresToUi(arr);
    return encounter;
  }

  private toPersistEncounter(encounter: Encounter): Encounter {
    const arr = encounter?.physical_examination;
    if (!Array.isArray(arr) || arr.length === 0) return encounter;
    encounter.physical_examination =
      this._labUnitConv.convertMeasuresToStore(arr);
    return encounter;
  }
}
