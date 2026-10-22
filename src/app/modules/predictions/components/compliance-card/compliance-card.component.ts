import { Component, Input } from '@angular/core';
import {
  AttributeTemplate,
  isThresholdKey,
} from '@config/service/coded-values.config';

export class RiskAttribute {
  constructor(
    public code: string,
    public template: AttributeTemplate,
    public value: number,
  ) {}
}

@Component({
  selector: 'heart-compliance-card',
  templateUrl: './compliance-card.component.html',
  styleUrls: ['./compliance-card.component.scss'],
})
export class ComplianceCardComponent {
  @Input() inputs: RiskAttribute[] = [];

  getColor(section: 'min' | 'r-y' | 'y-g' | 'g-y' | 'y-r' | 'max') {
    switch (section) {
      case 'min':
        return '#ff3b1f';
      case 'r-y':
        return '#ffe066';
      case 'y-g':
        return '#2ecc71';
      case 'g-y':
        return '#ffe066';
      case 'y-r':
      case 'max':
        return '#ff3b1f';
    }
  }

  protected getMinColor(attr: AttributeTemplate) {
    if (attr.threshold['r-y'] !== undefined) return '#ff3b1f';
    else if (attr.threshold['y-g'] !== undefined) return '#ffe066';
    else return '#2ecc71';
  }

  protected gerMaxColor(attr: AttributeTemplate) {
    if (attr.threshold['y-r'] !== undefined) return '#ff3b1f';
    else if (attr.threshold['g-y'] !== undefined) return '#ffe066';
    else return '#2ecc71';
  }

  protected getBreakpoints(
    attr: RiskAttribute,
  ): { value: number; color: string }[] {
    const ret: { value: number; color: string }[] = [];
    const template = attr.template;
    ret.push({
      value: template.min,
      color: this.getMinColor(template),
    });
    Object.entries(attr.template.threshold).forEach(([key, value]) => {
      if (isThresholdKey(key) && value != undefined) {
        ret.push({
          value: value,
          color: this.getColor(key),
        });
      }
    });
    ret.push({
      value: template.max,
      color: this.gerMaxColor(template),
    });
    return ret;
  }

  getCategories() {
    const categories = this.inputs
      .map((ra) => ra.template.category)
      .filter((cat) => cat !== undefined);
    return [...new Set(categories), undefined];
  }

  getItems(category: string | undefined): RiskAttribute[] {
    return this.inputs.filter((ra) => ra.template.category == category) ?? [];
  }
}
