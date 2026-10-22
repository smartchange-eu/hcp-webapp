import { Injectable } from '@angular/core';
import { Dictionary } from '@eng-it4h/heart-ui-converter';
import {
  CodedValue,
  GenericQuantitativeMeasure,
  Measure,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';

export type UiUnit = 'mmol/L' | 'mg/dL';
export enum Analyte {
  FASTING_GLUCOSE = 'FASTING_GLUCOSE',
  TOTAL_CHOL = 'TOTAL_CHOL',
  LDL_CHOL = 'LDL_CHOL',
  HDL_CHOL = 'HDL_CHOL',
}

@Injectable({ providedIn: 'root' })
export class LabUnitConversionService {
  private readonly codeMap: Record<string, Analyte> = {
    '76629-5': Analyte.FASTING_GLUCOSE,
    '14647-2': Analyte.TOTAL_CHOL,
    '14646-4': Analyte.LDL_CHOL,
    '22748-8': Analyte.HDL_CHOL,
  };

  private ui: UiUnit;

  constructor() {
    this.ui = environment.labDefaultUnit === 'MG_DL' ? 'mg/dL' : 'mmol/L';
  }

  public isMgDl(): boolean {
    return this.ui === 'mg/dL';
  }

  public isMmolL(): boolean {
    return this.ui === 'mmol/L';
  }

  public convertMeasuresToStore(arr: Measure[]): Measure[] {
    return arr.map((m) => {
      if (m instanceof GenericQuantitativeMeasure) {
        return this.toBackend(m);
      }
      return m;
    });
  }

  public convertMeasuresToUi(arr: Measure[]): Measure[] {
    return arr.map((m) => {
      if (m instanceof GenericQuantitativeMeasure) {
        return this.toDisplay(m);
      }
      return m;
    });
  }

  public toDisplay(m: GenericQuantitativeMeasure): GenericQuantitativeMeasure {
    const a = this.codeMap[m.cvType.code];
    if (m.value == null || isNaN(m.value) || !a) return m;

    if (this.unitCodeOf(m?.unit) === 'mmol/L' && this.ui == 'mg/dL') {
      const mgVal = this.mmolToMg(a, m.value);
      m.value = this.roundForUi(a, 'mg/dL', mgVal);
      m.unit = this.makeUnit('mg/dL');
    }
    return m;
  }

  public toBackend(m: GenericQuantitativeMeasure): GenericQuantitativeMeasure {
    const a = this.codeMap[m.cvType.code];
    if (m.value == null || isNaN(m.value) || !a) return m;

    if (this.unitCodeOf(m?.unit) === 'mg/dL') {
      m.value = this.mgToMmol(a, m.value);
      m.unit = this.makeUnit('mmol/L');
    }
    return m;
  }

  private unitCodeOf(unit: any): UiUnit | undefined {
    if (!unit) return undefined;
    if (typeof unit === 'string') {
      return unit === 'mg/dL' || unit === 'mmol/L' ? unit : undefined;
    }
    const code = unit?.code ?? unit?.display;
    if (code === 'mg/dL' || code === 'mmol/L') return code;
    return undefined;
  }

  private makeUnit(code: UiUnit): CodedValue {
    return new CodedValue(Dictionary.UNIT_OF_MEASURE, code, code);
  }
  private mgToMmol(a: Analyte, mg: number): number {
    switch (a) {
      case Analyte.FASTING_GLUCOSE:
        return mg * 0.0555;
      case Analyte.TOTAL_CHOL:
      case Analyte.LDL_CHOL:
      case Analyte.HDL_CHOL:
        return mg * 0.0259;
      default:
        return mg;
    }
  }

  private mmolToMg(a: Analyte, mmol: number): number {
    switch (a) {
      case Analyte.FASTING_GLUCOSE:
        return mmol * 18.02;
      case Analyte.TOTAL_CHOL:
      case Analyte.LDL_CHOL:
      case Analyte.HDL_CHOL:
        return mmol * 38.67;
      default:
        return mmol;
    }
  }

  private roundForUi(a: Analyte, unit: UiUnit, v: number): number {
    const decimals =
      a === Analyte.FASTING_GLUCOSE
        ? unit === 'mmol/L'
          ? 1
          : 0
        : unit === 'mmol/L'
        ? 2
        : 0;
    const pow = Math.pow(10, decimals);
    return Math.round(v * pow) / pow;
  }
}
