import { Component, Input, OnInit } from '@angular/core';
import { CommonChartConf } from '@config/charts.conf';
import { Nutrition } from '@eng-it4h/heart-ui-model';
import { Color, ScaleType, ColorHelper } from '@swimlane/ngx-charts';
import { format } from 'date-fns';

class Series {
  constructor(
    public name: Date,
    public value: number,
  ) {}
}

@Component({
  selector: 'hcp-nutrition-barchart',
  templateUrl: './nutrition-barchart.component.html',
  styleUrls: ['./nutrition-barchart.component.css'],
})
export class NutritionBarchartComponent implements OnInit {
  @Input() nutritionItems: Nutrition[] = [];
  @Input() dateFormat: string = CommonChartConf.dateFormat;
  @Input() colorScheme: Color = CommonChartConf.colorScheme;

  private cHelper?: ColorHelper;

  protected groupedData: {
    product: string;
    series: Series[];
    unitOfMeasure: string;
  }[] = [];

  ngOnInit() {
    this.cHelper = new ColorHelper(
      this.colorScheme,
      ScaleType.Ordinal,
      this.colorScheme.domain,
    );
    this.groupedData = this.processNutritionData(this.nutritionItems);
  }

  private processNutritionData(nutritionItems: Nutrition[]): any[] {
    const map = new Map<string, { series: Series[]; unitOfMeasure: string }>();

    for (const item of nutritionItems) {
      if (!item.items || !Array.isArray(item.items)) {
        continue;
      }

      for (const entry of item.items) {
        const type = entry.product?.uniqueLabelKey;
        let unitOfMeasure = 'patient.nutrition.' + (entry.unit.code || '');

        if (!map.has(type)) {
          map.set(type, { series: [], unitOfMeasure });
        }

        map
          .get(type)!
          .series.push(new Series(new Date(item.date), entry.quantity));
      }
    }
    map.forEach((item, key) => {
      item.series = item.series.sort(
        (a, b) => a.name.getTime() - b.name.getTime(),
      );
    });
    return Array.from(map.entries()).map(([product, data]) => ({
      product,
      series: data.series,
      unitOfMeasure: data.unitOfMeasure,
    }));
  }

  // this forces the same color for all bars
  protected customColors = (seriesName: string) => {
    return this.cHelper?.getColor(0);
  };

  // format the x axis using the input date format
  protected xAxisTickFormatting = (val: any) => {
    if (val instanceof Date) {
      return format(val, this.dateFormat);
    } else {
      return val;
    }
  };
}
