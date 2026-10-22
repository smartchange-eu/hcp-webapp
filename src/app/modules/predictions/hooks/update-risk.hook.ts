import { Hook } from '@eng-it4h/heart-ui-cdss';

export class UpdateRiskHook extends Hook {
  public constructor(private ages: number[]) {
    super();
  }

  public get hook(): string {
    return 'risk-update';
  }

  public contextToJSON(): unknown {
    return { ages: this.ages };
  }
}
