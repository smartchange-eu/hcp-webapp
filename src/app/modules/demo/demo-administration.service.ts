import { Injectable } from '@angular/core';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import { environment } from '@env/environment';

import { HeartUiCdssService } from '@eng-it4h/heart-ui-cdss';
import {
  Answer,
  AnswerGroup,
  CounsellingPrescription,
  Encounter,
  EncounterQuestionnaire,
  EncounterType,
  GenericQuantitativeMeasure,
  Nutrition,
  NutritionItem,
  Patient,
  Questionnaire,
  QuestionnaireResponse,
  ResponseStatus,
  Risk,
} from '@eng-it4h/heart-ui-model';
import { InitialRiskHook } from '@modules/predictions/hooks/initial-risk.hook';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { PilotRestControllerService } from '../backend-api/openapi';
import { DemoConfig, DemoType, Profile, ProfileType } from './demo.config';
import { hepa } from './profiles/hepa';
import { yfs } from './profiles/yfs';
import { yfs2 } from './profiles/yfs2';
@Injectable({
  providedIn: 'root',
})
export class DemoAdministrationService {
  private currentDemoPatient?: Patient;
  public initialQR?: QuestionnaireResponse;
  public initialQ?: Questionnaire;

  protected historyQR?: QuestionnaireResponse;
  public historyQ?: Questionnaire;

  protected lifestyleQR?: QuestionnaireResponse;
  public lifestyleQ?: Questionnaire;

  public ready: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private _api: PilotRestControllerService,
    private _backendService: HeartUiConnectorService,
    private _brokerCDSS: HeartUiCdssService,
  ) {
    this._api.basePath = environment.apiUrl;
    this.fetchQuestionnaires();
  }

  set patient(p: Patient | undefined) {
    this.currentDemoPatient = p;
  }

  get patient() {
    return this.currentDemoPatient;
  }

  public async generateDemoData(
    demoLevel: DemoType,
    type: ProfileType,
  ): Promise<void> {
    await this.createProfile(demoLevel, type);
    await this.getInitialRisk();
    await this.createFullEncounter(demoLevel, type);
  }

  public async createProfile(level: DemoType, type: ProfileType) {
    await this.createDemoMeasures(level, type, undefined, false);
    await this.createDemoMeasures(level, type, undefined, true);
    await this.createNutrition(level, type);
    if (this.initialQ)
      this.saveQuestionnaire(level, this.initialQ, undefined, type);
  }

  public async createFullEncounter(level: DemoType, type: ProfileType) {
    const encounter = await this.createEncounter();
    const vital = await this.createDemoMeasures(level, type, encounter);
    encounter.physical_examination = vital;

    if (this.historyQ) {
      const hist = await this.saveQuestionnaire(
        level,
        this.historyQ,
        encounter,
        type,
      );
      if (hist)
        encounter.setQuestionnaire(EncounterQuestionnaire.HEALTH_HISTORY, hist);
    }

    if (this.lifestyleQ) {
      const qr = await this.saveQuestionnaire(
        level,
        this.lifestyleQ,
        encounter,
        type,
      );
      if (qr) encounter.setQuestionnaire(EncounterQuestionnaire.LIFESTYLE, qr);
    }
    return encounter;
  }

  public async getInitialRisk(): Promise<string> {
    if (this.currentDemoPatient) {
      const cards = await lastValueFrom(
        this._brokerCDSS.updateCards(
          this.currentDemoPatient!.id + '',
          new InitialRiskHook([55]),
        ),
      );
      if (
        cards &&
        cards.length > 0 &&
        cards[0].suggestions &&
        cards[0].suggestions.length > 0
      ) {
        const actions = cards[0].suggestions[0].actions;
        const risk = actions?.find((a) => a.resource.resourceType === 'Risk')
          ?.resource as Risk;
        if (risk) {
          risk.patient = this.currentDemoPatient;
          const ret = await this._backendService.riskConnector.create(risk);
          if (ret) {
            const sr = actions?.find(
              (a) => a.resource.resourceType === 'ServiceRequest',
            )?.resource as CounsellingPrescription;
            if (sr) {
              sr.supportingInfo = [ret];
              await this._backendService.serviceRequestConnector.createCounselling(
                sr,
              );
            }
          }
          return ret?.predictions?.at(0)?.level ?? 'No risk level';
        }
      }
    }
    return 'No risk level';
  }

  private getProfile(type: ProfileType = 'hepa'): Profile {
    switch (type) {
      case 'yfs':
        return yfs;
      case 'yfs2':
        return yfs2;
      case 'hepa':
      default:
        return hepa;
    }
  }
  private async fetchQuestionnaires(): Promise<void> {
    const qReference = new Questionnaire(DemoConfig.INITIAL_Q_TYPE);
    try {
      const questionnaire = await this.searchQuestionnaireByRef(qReference);
      if (questionnaire) {
        this.initialQ = questionnaire;
        this.initialQR = new QuestionnaireResponse(this.initialQ!);
      } else {
        console.error('Initial questionnaire not found');
      }
    } catch (error) {
      console.error('Error fetching initial questionnaire', error);
    }
    const hReference = new Questionnaire(DemoConfig.HISTORY_Q_TYPE);
    try {
      const questionnaire = await this.searchQuestionnaireByRef(hReference);
      if (questionnaire) {
        this.historyQ = questionnaire;
        this.historyQR = new QuestionnaireResponse(this.historyQ!);
      } else {
        console.error('History questionnaire not found');
      }
    } catch (error) {
      console.error('Error fetching history questionnaire', error);
    }
    const lReference = new Questionnaire(DemoConfig.LIFESTYLE_Q_TYPE);
    try {
      const questionnaire = await this.searchQuestionnaireByRef(lReference);
      if (questionnaire) {
        this.lifestyleQ = questionnaire;
        this.lifestyleQR = new QuestionnaireResponse(this.lifestyleQ!);
      } else {
        console.error('Lifestyle questionnaire not found');
      }
    } catch (error) {
      console.error('Error fetching lifestyle questionnaire', error);
    }
    this.ready.next(true);
  }

  private async saveQuestionnaire(
    level: DemoType,
    questionnaire: Questionnaire,
    encounter?: Encounter,
    type: ProfileType = 'hepa',
  ) {
    // 0. set the QuestionnaireResponse author
    const date = new Date();
    date.setDate(date.getDate() - 20);
    const patient = this.currentDemoPatient;
    const qr = new QuestionnaireResponse(questionnaire);
    qr.date = date;
    qr.status = ResponseStatus.completed;
    qr.subject = patient!;
    qr.answers = [];
    const profile = this.getProfile(type);
    const config = profile.questionnaires.find(
      (q) => q.id == questionnaire.questionnaireId,
    );
    if (config) {
      config.answers.forEach((a) => {
        if (a.groupId) {
          const group = new AnswerGroup();
          group.groupId = a.groupId;
          group.answers = [];
          a.answers.forEach((aa) => {
            if (aa[level] !== undefined) {
              const answ = new Answer();
              answ.questionId = aa.questionId;
              answ.value = aa[level]!;
              group.answers.push(answ);
            }
          });
          if (group.answers.length > 0) {
            qr.answers.push(group);
          }
        } else {
          a.answers.forEach((aa) => {
            if (aa[level] !== undefined) {
              const answ = new Answer();
              answ.questionId = aa.questionId;
              answ.value = aa[level]!;
              qr.answers.push(answ);
            }
          });
        }
      });
    }
    if (qr.answers.length === 0) {
      console.warn(
        `No answers found for questionnaire ${questionnaire.questionnaireId} at level ${level}`,
      );
    } else {
      return await this.saveQuestionnaireResponse(qr, encounter);
    }
  }

  private async saveQuestionnaireResponse(
    qr: QuestionnaireResponse,
    encounter?: Encounter,
  ): Promise<void | QuestionnaireResponse> {
    if (qr && qr.id) {
      await this._backendService.questionnaireConnector.updateResponse(
        qr,
        undefined,
        undefined,
      );
      // computing measures from questionnaire response
    } else {
      return await this._backendService.questionnaireConnector.createResponse(
        qr,
        undefined,
        encounter,
      );
    }
  }
  private async createEncounter(): Promise<Encounter> {
    const today = new Date();
    const e = new Encounter();
    e.patient = this.currentDemoPatient;
    e.serviceProvider = this.currentDemoPatient?.managingOrganization;
    e.type = EncounterType.FIRST_ENCOUNTER;
    const date = new Date(today);
    date.setDate(today.getDate() - 5);
    e.startDate = date;
    e.closingDate = today;
    return await this._backendService.encounterConnector.create(e);
  }

  private async createDemoMeasures(
    level: DemoType,
    set: ProfileType,
    enc?: Encounter,
    pa = false,
  ): Promise<GenericQuantitativeMeasure[]> {
    const measures = this.createMeasures(level, set, enc, pa);
    return (await this._backendService.measureConnector.create(
      measures,
      undefined,
      enc,
      true,
    )) as GenericQuantitativeMeasure[];
  }

  private createMeasures(
    level: DemoType,
    set: ProfileType,
    enc?: Encounter,
    pa = false,
  ): GenericQuantitativeMeasure[] {
    if (enc != undefined) {
      return this.createPyisiologicMeasures(level, set, true);
    } else if (pa) {
      return this.createWeeklyPaMeasures(level, set);
    } else {
      return this.createPyisiologicMeasures(level, set);
    }
  }

  private async createNutrition(level: DemoType, set: ProfileType = 'hepa') {
    const nutrition: Nutrition[] = this.createNutritionValues(level, set);
    return await this._backendService.nutritionConnector.create(nutrition);
  }

  /**
   * Creates N GenericQuantitativeMeasure objects for each specified CodedValue, one for each day of the past week, using values from paValues for the given level.
   * @param level 'low' | 'mod' | 'high'
   * @returns GenericQuantitativeMeasure[] array of measures
   */
  private createWeeklyPaMeasures(
    level: DemoType,
    set: ProfileType,
  ): GenericQuantitativeMeasure[] {
    const count = 30;
    const measures: GenericQuantitativeMeasure[] = [];
    const today = new Date();
    const profile = this.getProfile(set);
    for (const entry of profile.pa) {
      // Find the paValues entry for this code and level
      if (entry && entry[level] !== undefined) {
        const values = this.generateValues(
          count,
          entry[level] as number,
          entry.min,
          entry.max,
        );
        const cv = entry.code.code;
        const unit = entry.code.unit;
        for (let i = 0; i < count; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i - 20);
          if (values[i] !== undefined && values[i] !== 0) {
            const value = values[i];
            const measure = new GenericQuantitativeMeasure(value, cv, unit);
            measure.assertedWhen = date;
            measure.patient = this.currentDemoPatient!;
            measures.push(measure);
          }
        }
      }
    }
    return measures;
  }

  /**
   * Creates 7 GenericQuantitativeMeasure objects for each specified CodedValue, one for each day of the past week, using values from paValues for the given level.
   * @param level 'low' | 'mod' | 'high'
   * @returns GenericQuantitativeMeasure[] array of measures
   */
  private createPyisiologicMeasures(
    level: DemoType,
    set: ProfileType,
    encounter: boolean = false,
  ): GenericQuantitativeMeasure[] {
    const measures: GenericQuantitativeMeasure[] = [];
    const today = new Date();
    const profile = this.getProfile(set);
    const vitalValues = encounter ? profile.encounterMeasures : profile.vital;
    for (const entry of vitalValues) {
      // Find the entry for this code and level
      if (entry) {
        const date = new Date(today);
        if (encounter) {
          date.setDate(today.getDate() - 7);
        } else date.setDate(today.getDate() - 20);

        if (entry.components && entry.components?.length > 0) {
          const components: GenericQuantitativeMeasure[] = [];
          for (const comp of entry.components) {
            if (comp[level] === undefined) continue;
            const compMeasure = new GenericQuantitativeMeasure(
              comp[level],
              comp.code,
              entry.code.unit,
            );
            compMeasure.assertedWhen = date;
            compMeasure.patient = this.currentDemoPatient!;
            components.push(compMeasure);
          }
          const measure = new GenericQuantitativeMeasure(
            undefined,
            entry.code.code,
            entry.code.unit,
            components,
          );
          measure.assertedWhen = date;
          measure.patient = this.currentDemoPatient!;
          measures.push(measure);
        } else {
          const value = entry[level];
          if (value === undefined) continue;
          const measure = new GenericQuantitativeMeasure(
            value,
            entry.code.code,
            entry.code.unit,
          );
          measure.assertedWhen = date;
          measure.patient = this.currentDemoPatient!;
          measures.push(measure);
        }
      }
    }
    return measures;
  }

  private async searchQuestionnaireByRef(qref: Questionnaire) {
    return await this._backendService.questionnaireConnector.searchByReference(
      qref,
      undefined,
      false,
    );
  }

  /**
   * Creates 7 GenericQuantitativeMeasure objects for each specified CodedValue, one for each day of the past week, using values from paValues for the given level.
   * @param level 'low' | 'mod' | 'high'
   * @returns GenericQuantitativeMeasure[] array of measures
   */
  private createNutritionValues(
    level: DemoType,
    set: ProfileType,
  ): Nutrition[] {
    const nutrition: Nutrition = new Nutrition();
    nutrition.items = [];
    nutrition.patient = this.currentDemoPatient!;
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - 14);
    nutrition.date = date;
    const profile = this.getProfile(set);
    // Find the entry for this code and level
    profile.nutrition.forEach((value) => {
      if (value[level] !== undefined) {
        const item = new NutritionItem();
        item.type = value.category;
        item.product = value.type;
        item.quantity = value[level] as number;
        item.unit = value.unit;
        nutrition.items.push(item);
      }
    });
    return nutrition.items.length > 0 ? [nutrition] : [];
  }

  private generateValues(
    count: number,
    targetAvg: number,
    min: number,
    max: number,
  ): number[] {
    const EPS = 1e-2; // Small epsilon to avoid zero values

    // Ensure strictly positive minimum so no value is ever zero
    const effectiveMin = Math.max(min, EPS);
    // Guarantee a valid max greater than min
    const effectiveMax = Math.max(max, effectiveMin + EPS);

    // If caller requested a non-positive average, allow a slight deviation
    // but aim for at least the effective minimum so returned values stay > 0
    const adjustedTargetAvg = Math.max(targetAvg, effectiveMin);
    const targetSum = adjustedTargetAvg * count;

    // 1. Initialize with random values within effective range
    let values = Array.from({ length: count }, () =>
      Math.random() * (effectiveMax - effectiveMin) + effectiveMin,
    );

    // 2. Iteratively adjust to hit the target sum (within tolerance)
    for (let iter = 0; iter < 100; iter++) {
      const currentSum = values.reduce((a, b) => a + b, 0);
      const diff = (targetSum - currentSum) / count;

      // Apply adjustment and clamp to effectiveMin/effectiveMax
      values = values.map((v) => {
        const adjusted = v + diff;
        return Math.max(effectiveMin, Math.min(effectiveMax, adjusted));
      });

      const newSum = values.reduce((a, b) => a + b, 0);
      if (Math.abs(newSum - targetSum) < 1e-2) break;
    }

    // Final pass: ensure strictly positive non-zero values
    values = values.map((v) => (v <= EPS ? EPS : v));
    // trim digits to 2 decimal places
    values = values.map((v) => Math.round(v * 100) / 100);
    return values;
  }
}
