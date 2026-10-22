import { Component, Input, OnInit } from '@angular/core';
import {
  GenericQuantitativeMeasure,
  CodedValue,
} from '@eng-it4h/heart-ui-model';

@Component({
  selector: 'heart-patient-measurements-card',
  templateUrl: './patient-measurements-card.component.html',
  styleUrls: ['./patient-measurements-card.component.scss'],
})
export class PatientMeasurementsCardComponent implements OnInit {
  @Input() measures: GenericQuantitativeMeasure[] = [];
  @Input() codes: CodedValue[] = [];
  @Input() avoidDuplicates: boolean = true;
  @Input() average: boolean = false;
  @Input() daysThreshold: number = 15;
  protected toShow: GenericQuantitativeMeasure[] = [];

  ngOnInit(): void {
    if (this.codes.length === 0) {
      this.codes = this.measures.map((m) => m.cvType);
    }
    if (this.average) {
      this.toShow = this.computeAverage(
        this.measures,
        this.codes,
        this.daysThreshold,
      );
    } else if (this.avoidDuplicates) {
      this.toShow = this.removeDuplicates(this.measures);
    } else {
      this.toShow = this.measures.filter((m) =>
        this.codes.some(
          (code) => code.uniqueLabelKey === m.cvType.uniqueLabelKey,
        ),
      );
    }
  }

  private computeAverage(
    measures: GenericQuantitativeMeasure[],
    codes: CodedValue[],
    daysThreshold: number = 15,
  ): GenericQuantitativeMeasure[] {
    const averagedMeasures: GenericQuantitativeMeasure[] = [];
    codes.forEach((code) => {
      const measuresForCode = measures.filter(
        (m) => m.cvType.uniqueLabelKey === code.uniqueLabelKey,
      );

      // discard measures with no value or older than daysThreshold days
      const now = new Date();
      const fifteenDaysAgo = new Date(
        now.getTime() - daysThreshold * 24 * 60 * 60 * 1000,
      );
      const validMeasures = measuresForCode.filter(
        (m) =>
          m.value !== null &&
          m.value !== undefined &&
          m.assertedWhen >= fifteenDaysAgo,
      );
      if (validMeasures.length > 0) {
        const averageValue =
          validMeasures.reduce((sum, m) => sum + m.value, 0) /
          validMeasures.length;
        const averageMeasure: GenericQuantitativeMeasure =
          new GenericQuantitativeMeasure(
            averageValue,
            code,
            validMeasures[0].unit,
          );
        averagedMeasures.push(averageMeasure);
      }
    });
    return averagedMeasures;
  }

  removeDuplicates(
    measures: GenericQuantitativeMeasure[],
  ): GenericQuantitativeMeasure[] {
    const keys = this.codes.map((m) => m.uniqueLabelKey);
    const uniqueKeys = Array.from(new Set(keys));
    const uniqueMeasures: GenericQuantitativeMeasure[] = [];
    uniqueKeys.forEach((key) => {
      const measure = measures.find((m) => m.cvType.uniqueLabelKey === key);
      if (measure) {
        uniqueMeasures.push(measure);
      }
    });
    return uniqueMeasures;
  }
}
