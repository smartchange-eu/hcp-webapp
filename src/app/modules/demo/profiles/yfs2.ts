import { CodedValue } from '@eng-it4h/heart-ui-model';
import { DemoConfig, Profile } from '../demo.config';

export const yfs2: Profile = {
  nutrition: [
    {
      category: DemoConfig.food,
      type: DemoConfig.fruit,
      low: 0.3,
      mod: 1.5,
      high: 0.14,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.vegetable,
      low: 0.3,
      mod: 0.7,
      high: 0.7,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.nut,
      low: 6,
      mod: 3,
      high: 0,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.beverage,
      type: DemoConfig.sweetenedBeverage,
      low: 0.5,
      mod: 2.5,
      high: 0.5,
      unit: DemoConfig.servingsW,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.meat,
      low: 1,
      mod: 4.2,
      high: 1.7,
      unit: DemoConfig.servingsW,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.cereal,
      low: 3.3,
      mod: 2.9,
      high: 1.7,
      unit: DemoConfig.servingsD,
    },
  ],

  pa: [
    {
      code: DemoConfig.moderatePA,
      low: 12.5,
      mod: 11.8,
      high: 11.6,
      min: 8,
      max: 20,
    },
    {
      code: DemoConfig.vigorousPA,
      low: 6.2,
      mod: 5.9,
      high: 5.8,
      min: 4,
      max: 8,
    },
    {
      code: DemoConfig.steps,
      low: 14200,
      mod: 8500,
      high: 3800,
      min: 3000,
      max: 15000,
    },
    {
      code: DemoConfig.calories,
      low: 2100,
      mod: 2350,
      high: 2950,
      min: 1800,
      max: 3000,
    },
    {
      code: DemoConfig.sleep,
      low: 7.8,
      mod: 8.1,
      high: 9.2,
      min: 6,
      max: 12,
    },
    {
      code: DemoConfig.activeCalories,
      low: 780,
      mod: 480,
      high: 180,
      min: 150,
      max: 550,
    },
  ],

  vital: [
    {
      code: DemoConfig.height,
      low: 176.8,
      mod: 157.4,
      high: 161.2,
    },
    {
      code: DemoConfig.weight,
      low: 64.7,
      mod: 39,
      high: 45.8,
    },
    {
      code: DemoConfig.bmi, // BMI
      low: 20.7,
      mod: 15.74,
      high: 17.63,
    },
  ],
  encounterMeasures: [
    {
      code: DemoConfig.height,
      low: 176.8,
      mod: 157.4,
      high: 161.2,
    },
    {
      code: DemoConfig.weight, // weight
      low: 64.7,
      mod: 39,
      high: 45.8,
    },
    {
      code: DemoConfig.waist, // waist
      low: 67.2,
      mod: 74,
      high: 65.6,
    },
    {
      code: DemoConfig.bloodPressure, // BP
      low: 0,
      mod: 0,
      high: 0,
      components: [
        {
          code: DemoConfig.diastolic, // DIA
          low: 53,
          mod: 73,
          high: 65,
        },
        {
          code: DemoConfig.systolic, // SYS
          low: 132,
          mod: 119,
          high: 111,
        },
      ],
    },
    {
      code: DemoConfig.bmi, // BMI
      low: 20.7,
      mod: 15.74,
      high: 17.63,
    },
    {
      code: DemoConfig.glucose, // GLUCOSE
      low: 4.7,
      mod: 4.93,
      high: 4.8,
    },
    {
      code: DemoConfig.totalCholesterol, // Total Cholesterol
      low: 5.31,
      mod: 4.59,
      high: 5.84,
    },
    {
      code: DemoConfig.hdl, // HDL
      low: 1.34,
      mod: 1.55,
      high: 1.45,
    },
    {
      code: DemoConfig.ldl, // LDL
      low: 3.35,
      mod: 2.8,
      high: 4.8,
    },
  ],

  questionnaires: [
    {
      id: DemoConfig.INITIAL_Q_TYPE,
      answers: [
        {
          groupId: 'lifestyle',
          answers: [
            {
              questionId: 'screen-time-hours',
              low: 2,
              mod: 2,
              high: 2,
            },
          ],
        },
        {
          groupId: 'family-ses',
          answers: [
            {
              questionId: 'family-vehicle-count',
              low: '1',
              mod: '1',
              high: '1',
            },
            {
              questionId: 'family-has-own-bedroom',
              low: true,
              mod: true,
              high: true,
            },
            {
              questionId: 'family-computer-count',
              low: '2',
              mod: '2',
              high: '2',
            },
            {
              questionId: 'family-bathroom-count',
              low: '1',
              mod: '1',
              high: '1',
            },
            {
              questionId: 'family-has-dishwasher',
              low: true,
              mod: true,
              high: true,
            },
            {
              questionId: 'family-intl-travel-last-year-count',
              low: '1',
              mod: '1',
              high: '1',
            },
          ],
        },
        {
          groupId: 'pa-status',
          answers: [
            {
              questionId: 'physical-fitness-perception',
              low: new CodedValue('http://loinc.org', 'LA8967-7', 'Good'),
              mod: new CodedValue('http://loinc.org', 'LA8967-7', 'Good'),
              high: new CodedValue('http://loinc.org', 'LA8967-7', 'Good'),
            },
          ],
        },
      ],
    },
    {
      id: DemoConfig.LIFESTYLE_Q_TYPE,
      answers: [
        {
          groupId: 'pa-status',
          answers: [
            {
              questionId: '20-m-srt-laps',
              low: 65,
              mod: 50,
              high: 43,
            },
            {
              questionId: '20-m-srt-date',
              low: new Date(),
              mod: new Date(),
              high: new Date(),
            },
            {
              questionId: 'non-tracked-activity',
              low: false,
              mod: false,
              high: false,
            },
            { questionId: '20-m-srt', low: 11.87, mod: 10.91, high: 10.62 },
          ],
        },
        {
          groupId: 'lifestyle',
          answers: [
            {
              questionId: 'smoking-status',
              low: new CodedValue(
                'http://snomed.info/sct',
                '8392000',
                'Non-smoker (finding)',
              ),
              mod: new CodedValue(
                'http://snomed.info/sct',
                '8392000',
                'Non-smoker (finding)',
              ),
              high: new CodedValue(
                'http://snomed.info/sct',
                '8392000',
                'Non-smoker (finding)',
              ),
            },
            {
              questionId: 'alcohol-consumption',
              low: new CodedValue(
                'http://smartchange.eu/fhir/CodeSystem/nutrition-servings',
                '2',
                '2 per week',
              ),
              mod: new CodedValue(
                'http://smartchange.eu/fhir/CodeSystem/nutrition-servings',
                '1',
                'Once a week',
              ),
              high: new CodedValue(
                'http://smartchange.eu/fhir/CodeSystem/nutrition-servings',
                'never',
                'Never',
              ),
            },
          ],
        },
      ],
    },
    {
      id: DemoConfig.HISTORY_Q_TYPE,
      answers: [
        {
          answers: [
            {
              questionId: 'diagnosed_diabetes',
              low: false,
              mod: false,
              high: false,
            },
            {
              questionId: 'diagnosed_cvd',
              low: false,
              mod: false,
              high: false,
            },
          ],
        },
      ],
    },
  ],
};
