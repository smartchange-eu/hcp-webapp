import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Gender } from '@eng-it4h/heart-ui-model';
import chart from './percentiles/centile_charts';

export class CommonChartConf {
  public static defaultColorScheme: Color = {
    name: 'default',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#E16D3B', '#508AB2', '#7e7e7eff'],
  };

  public static areaColorScheme: Color = {
    name: 'default',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#007A7A', '#801B51', '#719A00', '#7e7e7eff'],
  };

  private static shuttleRunMap: Map<number, number> = new Map<number, number>([
    [7, 8.5],
    [15, 9.01],
    [23, 9.5],
    [32, 10.01],
    [41, 10.5],
    [51, 11.01],
    [61, 11.5],
    [72, 12.01],
    [83, 12.5],
    [94, 13.01],
    [106, 13.5],
    [118, 14.01],
    [131, 14.5],
    [144, 15.01],
    [157, 15.5],
    [171, 16.01],
    [185, 16.5],
    [200, 17.01],
    [215, 17.5],
    [231, 18.01],
    [247, 18.5],
  ]);

  public static view: any[] = [1200, 300];
  public static legend: boolean = true;
  public static showLabels: boolean = true;
  public static animations: boolean = true;
  public static xAxis: boolean = true;
  public static yAxis: boolean = true;
  public static showYAxisLabel: boolean = true;
  public static showXAxisLabel: boolean = true;
  public static xAxisLabel: string = 'Date';
  public static yAxisLabel: string = 'Value';
  public static timeline: boolean = true;
  public static colorScheme = this.defaultColorScheme;
  public static dateFormat = 'dd/MM/yyyy';
  public static gradient = true;
  public static percentilesTimespan: number = 1;

  public static getCentiles(code: string, g?: Gender) {
    return chart.find((c) => c.gender === g && c.code === code)?.chart;
  }

  public static srtLapsToSpeed(lap: number): number {
    let closestKey: number | undefined = undefined;

    for (const key of CommonChartConf.shuttleRunMap.keys()) {
      if (key >= lap && (closestKey === undefined || key < closestKey)) {
        closestKey = key;
      }
    }
    if (closestKey) {
      return CommonChartConf.shuttleRunMap.get(closestKey) ?? 18.5;
    }
    return 18.5;
  }
}
