import { Risk } from '@eng-it4h/heart-ui-model';

export function findOldestPrediction(risk: Risk): Risk.Prediction | undefined {
  if (!risk.predictions || risk.predictions.length === 0) {
    return undefined;
  }
  return risk.predictions.reduce(
    (oldest, person) => (person.age > oldest.age ? person : oldest),
    risk.predictions[0]
  );
}
