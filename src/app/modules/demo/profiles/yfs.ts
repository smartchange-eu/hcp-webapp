import { DemoConfig } from '../demo.config';
import { Profile } from './../demo.config';
import { CodedValue } from '@eng-it4h/heart-ui-model';

export const yfs: Profile = {
  nutrition: [
    {
      category: DemoConfig.food,
      type: DemoConfig.fruit,
      low: 0.7,
      mod: 0.7,
      high: 1.5,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.vegetable,
      low: 1.5,
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
      low: 2.5,
      mod: 2.5,
      high: 10.5,
      unit: DemoConfig.servingsW,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.meat,
      low: 7,
      mod: 3.7,
      high: 4.3,
      unit: DemoConfig.servingsW,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.cereal,
      low: 3,
      mod: 2.6,
      high: 2.6,
      unit: DemoConfig.servingsD,
    },
  ],

  pa: [
    {
      code: DemoConfig.moderatePA,
      low: 22.5,
      mod: 12.7,
      high: 13.6,
      min: 1,
      max: 30,
    },
    {
      code: DemoConfig.vigorousPA,
      low: 11.2,
      mod: 6.3,
      high: 6.8,
      min: 3,
      max: 20,
    },
    {
      code: DemoConfig.steps,
      low: 14200,
      mod: 8500,
      high: 3800,
      min: 500,
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
      low: 8.2,
      mod: 7.7,
      high: 8.1,
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
      low: 167,
      mod: 173.3,
      high: 178,
    },
    {
      code: DemoConfig.weight,
      low: 60.8,
      mod: 91.2,
      high: 67.7,
    },
    {
      code: DemoConfig.bmi,
      low: 21.87,
      mod: 30.37,
      high: 21.37,
    },
  ],
  encounterMeasures: [
    {
      code: DemoConfig.height,
      low: 167,
      mod: 173.3,
      high: 178,
    },
    {
      code: DemoConfig.weight,
      low: 60.8,
      mod: 91.2,
      high: 67.7,
    },
    {
      code: DemoConfig.waist,
      low: 68.3,
      mod: 79.4,
      high: 62.9,
    },
    {
      code: DemoConfig.bloodPressure, // BP
      low: 0,
      mod: 0,
      high: 0,
      components: [
        {
          code: DemoConfig.diastolic, // DIA
          low: 69,
          mod: 67,
          high: 50,
        },
        {
          code: DemoConfig.systolic, // SYS
          low: 117,
          mod: 127,
          high: 142,
        },
      ],
    },
    {
      code: DemoConfig.bmi, // BMI
      low: 21.87,
      mod: 30.37,
      high: 21.37,
    },
    {
      code: DemoConfig.glucose, // GLUCOSE
      low: 4.6,
      mod: 5.02,
      high: 5.2,
    },
    {
      code: DemoConfig.totalCholesterol, // Total Cholesterol
      low: 4.53,
      mod: 4.39,
      high: 5.25,
    },
    {
      code: DemoConfig.hdl, // HDL
      low: 1.43,
      mod: 1.07,
      high: 1.42,
    },
    {
      code: DemoConfig.ldl, // LDL
      low: 2.79,
      mod: 2.78,
      high: 3.46,
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
              low: 83,
              mod: 60,
              high: 83,
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
            { questionId: '20-m-srt', low: 12.51, mod: 11.37, high: 12.5 },
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
                '77176002',
                'Smoker (finding)',
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
                'never',
                'Never',
              ),
              mod: new CodedValue(
                'http://smartchange.eu/fhir/CodeSystem/nutrition-servings',
                'never',
                'Never',
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
