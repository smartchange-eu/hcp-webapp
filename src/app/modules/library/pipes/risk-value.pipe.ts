import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'riskPercent',
})
export class RiskValuePipe implements PipeTransform {
  constructor() {}

  transform(value: number): number {
    return Math.round(value * 10000) / 100;
  }
}
