import { CodedValueConfig } from '@config/service/coded-values.config';
import { CodedValue } from '@eng-it4h/heart-ui-model';

export type DemoCodingsCV = {
  code: CodedValue;
  unit: CodedValue;
};
export class DemoConfig {
  public static readonly food = new CodedValue(
    'http://snomed.info/sct',
    '255620007',
    'Food (substance)',
  );
  public static readonly beverage = new CodedValue(
    'http://snomed.info/sct',
    '226465004',
    'Drinks (substance)',
  );

  public static readonly servingsD = new CodedValue(
    'http://unitsofmeasure.org',
    '{#}/d',
    undefined,
    'number per day',
  );
  public static readonly servingsW = new CodedValue(
    'http://unitsofmeasure.org',
    '{#}/wk',
    undefined,
    'number per week',
  );

  public static readonly fruit = new CodedValue(
    'http://snomed.info/sct',
    '72511004',
    'Fruit (substance)',
  );

  public static readonly vegetable = new CodedValue(
    'http://snomed.info/sct',
    '22836000',
    'Vegetable (substance)',
  );
  public static readonly nut = new CodedValue(
    'http://snomed.info/sct',
    '13577000',
    'Nut (substance)',
  );
  public static readonly sweetenedBeverage = new CodedValue(
    'http://snomed.info/sct',
    '818989004',
    'Sugar sweetened beverage (substance)',
  );
  public static readonly meat = new CodedValue(
    'http://snomed.info/sct',
    '28647000',
    'Meat (substance)',
  );
  public static readonly cereal = new CodedValue(
    'http://snomed.info/sct',
    '23182003',
    'Cereal grain (substance)',
  );

  public static readonly moderatePA: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '77592-4'),
    unit: new CodedValue(
      'http://unitsofmeasure.org',
      'min/d',
      'minute per day',
    ),
  };
  public static readonly vigorousPA: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '77593-2'),
    unit: new CodedValue(
      'http://unitsofmeasure.org',
      'min/d',
      'minute per day',
    ),
  };
  public static readonly steps: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '41950-7'),
    unit: new CodedValue(
      'http://unitsofmeasure.org',
      '{#}/d',
      'number per day',
    ),
  };
  public static readonly calories: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '41981-2'),
    unit: new CodedValue(
      'http://unitsofmeasure.org',
      'kcal/d',
      'kilocalorie per day',
    ),
  };
  public static readonly sleep: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '93832-4'),
    unit: new CodedValue('http://unitsofmeasure.org', 'h/d', 'hour per day'),
  };
  public static readonly activeCalories: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '93819-1'),
    unit: new CodedValue(
      'http://unitsofmeasure.org',
      'kcal/d',
      'kilocalorie per day',
    ),
  };

  public static readonly height: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '8302-2'),
    unit: new CodedValue('http://unitsofmeasure.org', 'cm', 'cm'),
  };

  public static readonly waist: DemoCodingsCV = {
    code: new CodedValue('http://snomed.info/sct', '276361009'),
    unit: new CodedValue('http://unitsofmeasure.org', 'cm', 'cm'),
  };
  public static readonly weight: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '29463-7'),
    unit: new CodedValue('http://unitsofmeasure.org', 'kg', 'kg'),
  };
  public static readonly bmi: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '39156-5'),
    unit: new CodedValue('http://unitsofmeasure.org', 'kg/m2', 'kg/m2'),
  };
  public static readonly glucose: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '76629-5'),
    unit: new CodedValue('http://unitsofmeasure.org', 'mmol/L', 'mmol/L'),
  };
  public static readonly totalCholesterol: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '14647-2'),
    unit: new CodedValue('http://unitsofmeasure.org', 'mmol/L', 'mmol/L'),
  };
  public static readonly hdl: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '14646-4'),
    unit: new CodedValue('http://unitsofmeasure.org', 'mmol/L', 'mmol/L'),
  };
  public static readonly ldl: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '22748-8'),
    unit: new CodedValue('http://unitsofmeasure.org', 'mmol/L', 'mmol/L'),
  };

  public static readonly bloodPressure: DemoCodingsCV = {
    code: new CodedValue('http://loinc.org', '35094-2'),
    unit: new CodedValue('http://unitsofmeasure.org', 'mm[Hg]', 'mmHg'),
  };

  public static readonly systolic: CodedValue = new CodedValue(
    'http://loinc.org',
    '8480-6',
  );
  public static readonly diastolic: CodedValue = new CodedValue(
    'http://loinc.org',
    '8462-4',
  );

  public static readonly LIFESTYLE_Q_TYPE =
    CodedValueConfig.questionnaireRefs[2];
  public static readonly HISTORY_Q_TYPE = CodedValueConfig.questionnaireRefs[1];
  public static readonly INITIAL_Q_TYPE = CodedValueConfig.questionnaireRefs[0];
}

export type Profile = {
  nutrition: {
    type: CodedValue;
    category: CodedValue;
    low?: number;
    mod?: number;
    high?: number;
    unit: CodedValue;
  }[];

  pa: {
    code: DemoCodingsCV;
    low?: number;
    mod?: number;
    high?: number;
    min: number;
    max: number;
  }[];

  vital: {
    code: DemoCodingsCV;
    low?: number;
    mod?: number;
    high?: number;
    components?: {
      code: CodedValue;
      low?: number;
      mod?: number;
      high?: number;
    }[];
  }[];

  encounterMeasures: {
    code: DemoCodingsCV;
    low?: number;
    mod?: number;
    high?: number;
    components?: {
      code: CodedValue;
      low?: number;
      mod?: number;
      high?: number;
    }[];
  }[];

  questionnaires: {
    id: string;
    answers: {
      groupId?: string;
      answers: {
        questionId: string;
        low?: string | number | boolean | CodedValue | Date;
        mod?: string | number | boolean | CodedValue | Date;
        high?: string | number | boolean | CodedValue | Date;
      }[];
    }[];
  }[];
};

export type DemoType = 'low' | 'mod' | 'high';
export type ProfileType = 'yfs' | 'yfs2' | 'hepa';
