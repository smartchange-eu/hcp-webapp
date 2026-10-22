import { CodedValue } from '@eng-it4h/heart-ui-model';

export type ChartTarget = {
  code: CodedValue;
  targetMin?: number;
  targetMax?: number;
};
