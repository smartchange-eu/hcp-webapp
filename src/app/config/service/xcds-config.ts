import { Patient, Risk, Role, Shareable } from '@eng-it4h/heart-ui-model';
import { ActionType, Card } from '@eng-it4h/heart-ui-cdss';
import { ActionsService } from '../../modules/service/services/actions.service';

export class XcdsConfig {
  public static ACTION_RESOLVER_CONFIG = new Map<
    ActionsService.ResolveAction,
    { urls: string[]; fn: ActionsService.EnrichResourceFn }
  >([
    [
      {
        resourceType: 'Risk',
        code: undefined,
        actionTypes: [ActionType.create, ActionType.update],
      },
      {
        urls: ['web', 'hcp', 'dashboard', 'risk'],
        fn: (s: Shareable, p: Patient, card: Card) => {
          const risk = s as Risk;
          if (p) risk.patient = p;
          if (!risk.date) risk.date = card.createdOn ?? new Date();
          if (card.uuid) risk.mitigation = card.uuid;
          risk.predictions.forEach((p) => {
            p.range.min = Math.round(p.range.min * 100) / 100;
            p.range.max = Math.round(p.range.max * 100) / 100;
          });
          return s;
        },
      },
    ],
  ]);

  public static xcdsDisabledRoles = [
    Role.GENETICIST,
    Role.LAB_GENETICIST,
    Role.RESEARCHER_GENETICIST,
  ];
}
