import { HeartValueSet, ModelToFHIRUtils } from '@eng-it4h/heart-ui-converter';
import { CentileValue } from '@eng-it4h/heart-ui-measure';
import { Gender } from '@eng-it4h/heart-ui-model';
import bmi_female from './bmi_female';
import bmi_male from './bmi_male';
const bmi_code = ModelToFHIRUtils.toCodedValueModel(
  HeartValueSet.Common.Measurement.BMI_CODINGS.toCodeableConcept(),
).uniqueLabelKey;
const centiles: {
  gender: Gender;
  code: string;
  chart: Map<number, CentileValue[]>;
}[] = [
  { gender: Gender.female, code: bmi_code, chart: bmi_female },
  { gender: Gender.male, code: bmi_code, chart: bmi_male },
];

export default centiles;
