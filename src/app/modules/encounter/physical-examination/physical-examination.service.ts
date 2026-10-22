import { Inject, Injectable } from '@angular/core';
import {
  Dictionary,
  HeartValueSet,
  ModelToFHIRUtils,
} from '@eng-it4h/heart-ui-converter';
import {
  BMI,
  Choice,
  CodedValue,
  CodedValueQuestion,
  GenericQuantitativeFormStructure,
  GenericQuantitativeMeasure,
  Height,
  LengthUnit,
  Measure,
  Patient,
  Weight,
  WeightUnit,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { max } from 'date-fns';
import { isArray } from 'lodash-es';
import { EncounterService } from '../encounter.service';
import {
  PE_CONFIG,
  PhysicalExaminationModuleConfig,
} from './physical-examination.module';
// enhancement - we can prepare more than one structure, and load the most appropriate for the view - or we can offer the option to the user

@Injectable()
export class PhysicalExaminationService {
  private debug = environment.debug && false;
  private bmiCode: CodedValue = ModelToFHIRUtils.toCodedValueModel(
    HeartValueSet.Common.Measurement.BMI_CODINGS.toCodeableConcept()
  );

  constructor(
    private _encounterService: EncounterService,
    @Inject(PE_CONFIG) readonly config: PhysicalExaminationModuleConfig
  ) {}

  getFormToRender(): GenericQuantitativeFormStructure {
    const newObj = this.config.structure!;
    this.orderConsolidation(newObj);
    this.consolidateCodedValues(newObj);
    this.checkAllowedAnswers(newObj);
    if (this.debug) {
      console.log(newObj);
    }
    return newObj;
  }

  get mandDate() {
    return this.config.mandDate;
  }

  get mandNotes() {
    return this.config.mandNotes;
  }

  orderConsolidation(newObj: GenericQuantitativeFormStructure) {
    let sections = newObj?.sections.length;
    for (let i = 0; i < sections; i++) {
      const currS = newObj.sections[i];
      currS.order = i;
      // let qs = currS.valuesToCollect?.length; // non più valido se utilizziamo i componenti (e.g. blood pressure)
      // for (let j = 0; j < qs; j++) {
      //   const currQ = currS.valuesToCollect[j];
      //   currQ.order = j;
      // }

      let j = 0;
      currS.valuesToCollect?.forEach((currQ) => {
        if (!currQ.components) {
          currQ.order = j++;
        } else {
          currQ.components.forEach((comp) => {
            comp.order = j++;
          });
        }
      });
    }
  }

  checkAllowedAnswers(newObj: GenericQuantitativeFormStructure) {
    newObj?.sections?.forEach((s) => {
      s.valuesToCollect?.forEach((question) => {
        let ans = question.permittedAnswers;
        if (ans && isArray(ans)) {
          let choices: Choice[] = [];
          ans.forEach((a) => {
            if (
              (a.value as CodedValue)?.system &&
              (a.value as CodedValue)?.code
            ) {
              const c: Choice = new Choice(
                new CodedValue(
                  (a.value as CodedValue).system,
                  (a.value as CodedValue).code
                )
              );
              choices.push(c);
            }
          });
          question.permittedAnswers = choices;
        }
      });
    });
  }

  consolidateCodedValues(newObj: GenericQuantitativeFormStructure) {
    newObj?.sections?.forEach((s) => {
      s.valuesToCollect?.forEach((question) => {
        question.cvToCollect = new CodedValue(
          question.cvToCollect.system,
          question.cvToCollect.code
        );
        question.components?.forEach((comp) => {
          comp.cvToCollect = new CodedValue(
            comp.cvToCollect.system,
            comp.cvToCollect.code
          );
        });
      });
    });
  }

  public getCodedValuesToQuery(
    formStructure: GenericQuantitativeFormStructure
  ): CodedValue[] {
    let toRet: CodedValue[] = [];

    formStructure.sections?.forEach((s) => {
      s.valuesToCollect?.forEach((cvq: CodedValueQuestion) => {
        toRet.push(
          new CodedValue(
            cvq.cvToCollect.system,
            cvq.cvToCollect.code,
            cvq.cvToCollect.display
          )
        );
      });
    });
    return toRet;
  }

  public getMeasures(
    cvs: CodedValue[],
    startDate?: Date,
    endDate?: Date
  ): Promise<Measure[]> {
    return this._encounterService.searchByPatientAndType(
      cvs,
      startDate,
      endDate
    );
  }

  public retrieveAllMeasures(
    formStructure: GenericQuantitativeFormStructure,
    startDate?: Date,
    endDate?: Date
  ): Promise<Measure[]> {
    return this.getMeasures(
      this.getCodedValuesToQuery(formStructure),
      startDate,
      endDate
    );
  }

  /**
   * Save the measures on the server and update the Encounter references
   * @param event
   */
  public async save(
    meas: GenericQuantitativeMeasure[],
    p: Patient
  ): Promise<Measure[]> {
    const toSave: GenericQuantitativeMeasure[] = [];

    // FIXME: mihgt want to move to configuration
    const weight = meas.find((m) => m.cvType.code === '29463-7');
    const heigth = meas.find((m) => m.cvType.code === '8302-2');
    let bmi = meas.find((m) => m.cvType.code === this.bmiCode.code);
    if (weight && heigth) {
      const newBMI = BMI.calculate(
        new Weight(weight.value, WeightUnit.kg),
        new Height(heigth.value, LengthUnit.cm)
      );

      if (!bmi) {
        bmi = new GenericQuantitativeMeasure(
          newBMI.value,
          this.bmiCode,
          new CodedValue(Dictionary.UNIT_OF_MEASURE, 'kg/m2', newBMI.unit)
        );
        bmi.patient = p;
        toSave.push(bmi);
      }
      bmi.value = newBMI.value;
      bmi.assertedWhen = max([heigth.assertedWhen, weight.assertedWhen]);
    }

    meas.forEach((m) => {
      m.patient = p;
    });
    toSave.push(...meas);
    return this._encounterService.addMeasures(toSave);
  }
}
