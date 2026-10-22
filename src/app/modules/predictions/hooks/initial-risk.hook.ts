import { Hook } from '@eng-it4h/heart-ui-cdss';

export class InitialRiskHook extends Hook {
  public constructor(private ages: number[]) {
    super();
  }

  public get hook(): string {
    return 'initial-risk';
  }

  public contextToJSON(): unknown {
    return { ages: this.ages };
  }
}
