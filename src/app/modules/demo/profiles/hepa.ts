import { DemoConfig } from '../demo.config';
import { Profile } from './../demo.config';
import { CodedValue } from '@eng-it4h/heart-ui-model';

export const hepa: Profile = {
  nutrition: [
    {
      category: DemoConfig.food,
      type: DemoConfig.fruit,
      mod: 4,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.vegetable,
      mod: 1,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.nut,
      mod: 3,
      unit: DemoConfig.servingsD,
    },
    {
      category: DemoConfig.beverage,
      type: DemoConfig.sweetenedBeverage,
      mod: 0,
      unit: DemoConfig.servingsW,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.meat,
      mod: 7,
      unit: DemoConfig.servingsW,
    },
    {
      category: DemoConfig.food,
      type: DemoConfig.cereal,
      mod: 3,
      unit: DemoConfig.servingsD,
    },
  ],

  pa: [
    {
      code: DemoConfig.moderatePA,
      mod: 44,
      min: 10,
      max: 60,
    },
    {
      code: DemoConfig.vigorousPA,
      mod: 0,
      min: 0,
      max: 20,
    },
    {
      code: DemoConfig.steps,
      mod: 8100,
      min: 500,
      max: 15000,
    },
    {
      code: DemoConfig.calories,
      mod: 1.5,
      min: 0,
      max: 3,
    },
    {
      code: DemoConfig.sleep,
      mod: 8.1,
      min: 6,
      max: 12,
    },
    {
      code: DemoConfig.activeCalories,
      mod: 0,
      min: 0,
      max: 550,
    },
  ],

  vital: [
    {
      code: DemoConfig.height,
      mod: 143,
    },
    {
      code: DemoConfig.weight,
      mod: 35.8,
    },
    {
      code: DemoConfig.bmi,
      mod: 17.5,
    },
  ],
  encounterMeasures: [
    {
      code: DemoConfig.height,
      mod: 143,
    },
    {
      code: DemoConfig.weight,
      mod: 35.8,
    },
    {
      code: DemoConfig.waist,
      mod: 62,
    },
    {
      code: DemoConfig.bloodPressure, // BP
      mod: 0,
      components: [
        {
          code: DemoConfig.diastolic, // DIA
          mod: 64,
        },
        {
          code: DemoConfig.systolic, // SYS
          mod: 103,
        },
      ],
    },
    {
      code: DemoConfig.bmi, // BMI
      mod: 17.5,
    },
    {
      code: DemoConfig.totalCholesterol, // Total Cholesterol
      mod: 4.6,
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
              mod: 2,
            },
          ],
        },
        {
          groupId: 'family-ses',
          answers: [
            {
              questionId: 'family-vehicle-count',
              mod: '2',
            },
            {
              questionId: 'family-has-own-bedroom',
              mod: true,
            },
            {
              questionId: 'family-computer-count',
              mod: '1',
            },
            {
              questionId: 'family-bathroom-count',
              mod: '1',
            },
            {
              questionId: 'family-has-dishwasher',
              mod: true,
            },
            {
              questionId: 'family-intl-travel-last-year-count',
              mod: '2+',
            },
          ],
        },
        {
          groupId: 'pa-status',
          answers: [
            {
              questionId: 'physical-fitness-perception',
              mod: new CodedValue('http://loinc.org', 'LA9206-9', 'Excellent'),
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
              questionId: '20-m-srt-date',
              mod: new Date(),
            },
            {
              questionId: 'non-tracked-activity',
              mod: true,
            },
            {
              questionId: 'non-tracked-time',
              mod: 3,
            },
          ],
        },
        {
          groupId: 'lifestyle',
          answers: [
            {
              questionId: 'smoking-status',
              mod: new CodedValue(
                'http://snomed.info/sct',
                '8392000',
                'Non-smoker (finding)',
              ),
            },
            {
              questionId: 'alcohol-consumption',
              mod: new CodedValue(
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
              mod: false,
            },
            {
              questionId: 'diagnosed_cvd',
              mod: false,
            },
          ],
        },
      ],
    },
  ],
};
