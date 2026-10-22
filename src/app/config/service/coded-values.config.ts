import { CodedValue, EncounterType, Gender } from '@eng-it4h/heart-ui-model';
import { riskAttributesThresholds } from '../risk-attributes-thresholds';
export type AttributeTemplate = {
  threshold: Record<'r-y' | 'y-g' | 'g-y' | 'y-r', number | undefined>;
  min: number;
  max: number;
  unit?: string;
  ageMin?: number;
  ageMax?: number;
  gender?: Gender;
  category?: string;
};

export class CodedValueConfig {
  public static readonly genderValues: Gender[] = [
    Gender.female,
    Gender.male,
    Gender.other,
  ];

  public static readonly familyMembersRelationships: CodedValue[] = [
    new CodedValue('http://terminology.hl7.org/CodeSystem/v3-RoleCode', 'MTH'),
    new CodedValue('http://terminology.hl7.org/CodeSystem/v3-RoleCode', 'FTH'),
    new CodedValue('http://terminology.hl7.org/CodeSystem/v3-RoleCode', 'SIB'),
  ];

  public static readonly trialGroups: CodedValue[] = [
    new CodedValue('http://it4h.eng.it/uhm/trial-group', 'intervention'),
    new CodedValue('http://it4h.eng.it/uhm/trial-group', 'control'),
  ];

  public static readonly encounterTypes: CodedValue[] = [
    new CodedValue(
      'http://smartchange.eu/encounter-type',
      EncounterType.FIRST_ENCOUNTER,
    ),
    new CodedValue('http://smartchange.eu/encounter-type', EncounterType.OTHER),
  ];

  public static readonly defaultPlanFocus: CodedValue = new CodedValue(
    'http://snomed.info/sct',
    '385991005',
  );

  public static readonly historyCodes: CodedValue[] = [
    new CodedValue('http://loinc.org', '8302-2'),
    new CodedValue('http://loinc.org', '29463-7'),
    new CodedValue('http://snomed.info/sct', '276361009'),
    new CodedValue('http://loinc.org', '35094-2'),
    new CodedValue('http://snomed.info/sct', '444981005'),
    new CodedValue('http://loinc.org', '39156-5'),
  ];

  public static readonly labCodes: CodedValue[] = [
    new CodedValue('http://loinc.org', '76629-5'),
    new CodedValue('http://loinc.org', '14647-2'),
    new CodedValue('http://loinc.org', '14646-4'),
    new CodedValue('http://loinc.org', '22748-8'),
  ];
  public static readonly summaryCodes: CodedValue[] = [
    new CodedValue('http://loinc.org', '8302-2'),
    new CodedValue('http://loinc.org', '29463-7'),
    new CodedValue('http://snomed.info/sct', '276361009'),
    new CodedValue('http://loinc.org', '39156-5'),
  ];

  public static readonly slofitCodes: CodedValue[] = [
    new CodedValue('http://loinc.org', '8302-2'),
    new CodedValue('http://loinc.org', '29463-7'),
    new CodedValue('http://slofit.org', 'MSMD'),
    new CodedValue('http://slofit.org', 'MTAP20'),
    new CodedValue('http://slofit.org', 'MT60'),
    new CodedValue('http://slofit.org', 'MPON'),
    new CodedValue('http://slofit.org', 'M600Mcas'),
    new CodedValue('http://slofit.org', 'MDT60'),
    new CodedValue('http://slofit.org', 'MVZG'),
  ];

  public static readonly wearableCategory: CodedValue = new CodedValue(
    'http://loinc.org',
    '77242-6',
  );

  public static readonly labCategory: CodedValue = new CodedValue(
    'http://loinc.org',
    '30954-2',
  );

  public static readonly historyCategory: CodedValue = new CodedValue(
    'http://loinc.org',
    '721491000000103',
  );

  public static readonly nutritionCategory: CodedValue = new CodedValue(
    'http://loinc.org',
    '75282-4',
  );
  public static readonly wearableCodes: CodedValue[] = [
    new CodedValue('http://loinc.org', '77592-4'),
    new CodedValue('http://loinc.org', '77593-2'),
    new CodedValue('http://loinc.org', '41950-7'),
    new CodedValue('http://loinc.org', '41981-2'),
    new CodedValue('http://loinc.org', '82290-8'), //intensity minutes
    new CodedValue('http://loinc.org', '93832-4'),
  ];

  public static readonly studyName = 'smartchange_feasibility_study';
  public static readonly initialRiskCode = new CodedValue(
    'http://loinc.org',
    '75484-6',
  );
  public static readonly featureUnits: Map<string, string> = new Map<
    string,
    string
  >([
    ['http://snomed.info/sct/77176002', ''], // SMOKING
    ['http://snomed.info/sct/276361009', 'http://unitsofmeasure.org|cm'], // WAIST
    ['http://snomed.info/sct/284472007', 'http://unitsofmeasure.org|cm'], // HIP
    ['http://snomed.info/sct/444981005', 'http://unitsofmeasure.org|/min'], //Resting_heart_rate
    ['http://loinc.org/76629-5', 'http://unitsofmeasure.org|mmol/L'], // Glucose
    ['http://loinc.org/70218-3', 'http://unitsofmeasure.org|mmol/L'], // Triglycerides
    ['http://loinc.org/8302-2', 'http://unitsofmeasure.org|cm'], //Height
    ['http://loinc.org/8462-4', 'http://unitsofmeasure.org|mmHG'], // DIA
    ['http://loinc.org/8480-6', 'http://unitsofmeasure.org|mmHG'], // SYS
    ['http://loinc.org/14646-4', 'http://unitsofmeasure.org|mmol/L'], // HDL
    ['http://loinc.org/14647-2', 'http://unitsofmeasure.org|mmol/L'], // TOTAL CHOL
    ['http://loinc.org/22748-8', 'http://unitsofmeasure.org|mmol/L'], // LDL
    ['http://loinc.org/29463-7', 'http://unitsofmeasure.org|kg'], //WEIGHT
    ['http://loinc.org/39156-5', 'http://unitsofmeasure.org|kg/m2'], //BMI
    ['http://loinc.org/101691-4', 'http://unitsofmeasure.org|hrs/wk'], // PA per WK
    ['http://loinc.org/74013-4', 'http://unitsofmeasure.org|g/d'], //ALCHOOL
    ['http://loinc.org/93832-4', 'http://unitsofmeasure.org|h/d'], //SLEEP
    ['http://smartchange.eu/fitness-speed', 'http://unitsofmeasure.org|km/h'], //FITNESS SPEED
    ['http://loinc.org/82290-8', 'http://unitsofmeasure.org|hrs/wk'], //INTENSITY MINUTES
  ]);

  public static readonly featureType: Map<string, 'B' | 'P'> = new Map<
    string,
    'B' | 'P'
  >([
    ['http://snomed.info/sct/77176002', 'B'],
    ['http://snomed.info/sct/276361009', 'P'],
    ['http://snomed.info/sct/284472007', 'P'],
    ['http://snomed.info/sct/444981005', 'P'],
    ['http://loinc.org/76629-5', 'P'],
    ['http://loinc.org/70218-3', 'P'],
    ['http://loinc.org/8302-2', 'P'],
    ['http://loinc.org/8462-4', 'P'],
    ['http://loinc.org/8480-6', 'P'],
    ['http://loinc.org/14646-4', 'P'],
    ['http://loinc.org/14647-2', 'P'],
    ['http://loinc.org/22748-8', 'P'],
    ['http://loinc.org/29463-7', 'P'],
    ['http://loinc.org/39156-5', 'P'],
    ['http://loinc.org/101691-4', 'B'],
    ['http://loinc.org/74013-4', 'B'],
    ['http://loinc.org/93832-4', 'B'],
    ['http://smartchange.eu/age-output', 'P'],
    ['http://smartchange.eu/diet-hhs', 'B'],
    ['http://smartchange.eu/diet-t2p', 'B'],
    ['http://smartchange.eu/fit-z-score', 'B'],
    ['http://smartchange.eu/pa-z-score', 'B'],
    ['http://loinc.org/46098-0', 'P'],
    ['http://loinc.org/30525-0', 'P'],
    ['http://loinc.org/45636-8', 'P'],
    ['http://smartchange.eu/fitness-speed', 'B'],
    ['http://loinc.org/82290-8', 'B'],
  ]);

  public static readonly questionnaireRefs: string[] = [
    'http://it4h.eng.it/uhm/Questionnaire/initial-risk-questionnaire',
    'http://it4h.eng.it/uhm/Questionnaire/prevention-patient-health-history',
    'http://it4h.eng.it/uhm/Questionnaire/prevention-patient-lifestyle',
  ];

  /**
   * Selects a risk attribute template by code, age, and gender.
   * @param code The code (e.g., LOINC/SNOMED URI)
   * @param age The age of the subject (number or string, e.g., 12, 'set-13', '>=16', etc.)
   * @param gender The gender (optional, e.g., 'male', 'female')
   * @returns The matching AttributeTemplate or undefined if not found
   */
  public static getRiskAttributeTemplate(
    code: string,
    age?: number,
    gender?: Gender,
  ): AttributeTemplate | undefined {
    const entries = riskAttributesThresholds[code];
    if (!entries) return undefined;

    // Filter by gender if provided
    let filtered = entries;
    if (gender) {
      filtered = filtered.filter((e) => !e.gender || e.gender === gender);
    }

    // Filter by age range if possible
    if (age !== undefined) {
      filtered = filtered.filter(
        (e) =>
          (e.ageMin === undefined || age >= e.ageMin) &&
          (e.ageMax === undefined || age <= e.ageMax),
      );
    }

    // Prefer the most specific match (with both age and gender), then age, then gender, then default
    if (filtered.length > 0) {
      // Sort: most specific first
      filtered.sort((a, b) => {
        const aSpec =
          (a.ageMin !== undefined || a.ageMax !== undefined ? 2 : 0) +
          (a.gender ? 1 : 0);
        const bSpec =
          (b.ageMin !== undefined || b.ageMax !== undefined ? 2 : 0) +
          (b.gender ? 1 : 0);
        return bSpec - aSpec;
      });
      return filtered[0];
    }

    // Fallback: return the first entry
    return entries[0];
  }
}

export function isThresholdKey(
  key: string,
): key is 'min' | 'r-y' | 'y-g' | 'g-y' | 'y-r' | 'max' {
  return ['r-y', 'y-g', 'g-y', 'y-r'].includes(key);
}
