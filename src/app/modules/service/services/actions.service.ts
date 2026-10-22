import { Injectable } from '@angular/core';
import { Action, ActionType, Card, Suggestion } from '@eng-it4h/heart-ui-cdss';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import { CodedValue, Patient, Shareable } from '@eng-it4h/heart-ui-model';
import { get } from 'lodash-es';
import { XcdsConfig } from '../../../config/service/xcds-config';
import { PatientService } from './patient.service';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  private _urlResolver: ActionsService.ActionResolver;

  constructor(
    private _backendService: HeartUiConnectorService,
    private _patientService: PatientService
  ) {
    const URL_RESOLVER_CONFIG = XcdsConfig.ACTION_RESOLVER_CONFIG;
    this._urlResolver = new ActionsService.ActionResolver(URL_RESOLVER_CONFIG);
  }

  public async resolveActions(actions: Action[], patient: Patient, card: Card) {
    const toPersist: Shareable[] = [];
    actions.forEach((action: Action) => {
      let resource = action.resource;
      if (resource) {
        const fn = this._urlResolver.matchFn(action);
        if (fn != undefined) {
          resource = fn(resource, patient, card);
          if (action.toPerform?.code == 'create') resource.id = undefined;
          toPersist.push(resource);
        }
      }
    });
    if (toPersist.length > 0) {
      await this._backendService.serverConnector.transactionWithShareable(
        toPersist
      );
      this._patientService.reload();
    }
  }

  /**
   * Given a suggestion it returns the URL of the UI meant to implement the related actions.
   *
   * An important assumption is that the UI has to support all the described actions of the suggestion to resolve it
   * @param card
   * @param suggestion
   */
  public resolveURL(card: Card, suggestion: Suggestion): string[] | undefined {
    if (card.uuid == undefined || suggestion.uuid == undefined) {
      throw new Error(
        `Missing required UUID(s) for ${card.label} and/or ${suggestion.label}`
      );
    }
    const path: string[] | undefined = this._urlResolver.matchUrl(suggestion);
    return path;
  }
}

export namespace ActionsService {
  // TODO: generalize the parameters of the function
  export type EnrichResourceFn = (
    resource: Shareable,
    patient: Patient,
    card: Card
  ) => Shareable;
  /**
   * Se of criteria used to describe how a view is able to manage a resource contained in a suggested action
   */
  export interface ResolveAction {
    // optional - describe if the view is able to manage a resource on in a given clinical context for which the suggestion is meant to support the user/HCP
    // clinicalContext?: string,

    // optional - describe the type of resource that the view can manage. This is attribute should always be defined.
    // Important: the attribute is checked wrt the 'resourceType' attribute used in the classes of the easy model (not with the FHIR resource type!!!)
    resourceType?: string;

    // optional - used to identify a resource not byt its type but by the sematic of the code assigned to it (e.g. in case of Observation)
    code?: string | CodedValue | number;

    // optional - path referring the resource attribute to be used to discrimate the resource. If not specified the 'code' will be matched on the 'code' attribute'
    // You can also refer to nested attributes (see lodash for the syntax)
    codePath?: string[] | string;

    // optional - describe if the view is able to perform only 'create', 'update' or 'delete' actions
    actionTypes?: ActionType[];

    routine?: EnrichResourceFn;
  }

  /**
   * Support class meant to define the relative path resolution needed to instruct the UI aobut the view to be rendered to manage a suggestion
   */
  export class ActionResolver {
    constructor(
      private readonly validPaths: Map<
        ActionsService.ResolveAction,
        { urls: string[]; fn: ActionsService.EnrichResourceFn }
      >
    ) {}

    private matchesOne(
      action: Action
    ): ActionsService.ResolveAction | undefined {
      return [...this.validPaths.keys()].find((rCondition: ResolveAction) => {
        let matches: boolean = true;

        // check if the action type matches with the card
        const actionToPerform: CodedValue | undefined = action.toPerform;
        if (actionToPerform != undefined && rCondition.actionTypes) {
          matches &&= rCondition.actionTypes.some(
            (at) =>
              at.toString().toLowerCase() == actionToPerform.code.toLowerCase()
          );
        }

        const resource = action.resource;
        if (resource) {
          const resourceType = action.resource.resourceType;
          // check if the resoruce type matches with the card
          if (
            resourceType != undefined &&
            rCondition.resourceType != undefined
          ) {
            matches &&= rCondition.resourceType == resourceType;
          }

          let resourceIdentifier: string | number | CodedValue =
            action.resource.code;
          // look for a custom field to be used as matching criteria than the default 'code' one
          if (rCondition.codePath!?.length > 0) {
            resourceIdentifier = get(resource, rCondition.codePath!);
          }

          // check if the identifier matches with the card
          if (resourceIdentifier != undefined && rCondition.code != undefined) {
            if (
              rCondition.code instanceof CodedValue &&
              resourceIdentifier instanceof CodedValue
            ) {
              const cv = rCondition.code as CodedValue;
              matches &&= resourceIdentifier.code == cv.code;
            } else if (typeof rCondition.code == 'number') {
              matches &&= true;
            } else {
              matches = false;
            }
          }

          matches = true;
        }
        return matches;
      });
    }

    private matchesAll(actions: Action[]): ResolveAction | undefined {
      let urlCommands: ResolveAction | undefined = undefined;

      if (actions) {
        this.validPaths.forEach((values, rCondition: ResolveAction) => {
          let matches: boolean = true;

          // check that the 'ResolveCondition' matches all actions
          for (let index = 0; index < actions.length && matches; index++) {
            const action: Action = actions[index];

            // check if the action type matches with the card
            const actionToPerform: CodedValue | undefined = action.toPerform;
            if (actionToPerform != undefined && rCondition.actionTypes) {
              matches &&= rCondition.actionTypes.some(
                (at) =>
                  at.toString().toLowerCase() ==
                  actionToPerform.code.toLowerCase()
              );
            }

            const resource = action.resource;
            if (resource) {
              const resourceType = action.resource.resourceType;
              // check if the resoruce type matches with the card
              if (
                resourceType != undefined &&
                rCondition.resourceType != undefined
              ) {
                matches &&= rCondition.resourceType == resourceType;
              }

              let resourceIdentifier: string | number | CodedValue =
                action.resource.code;
              // look for a custom field to be used as matching criteria than the default 'code' one
              if (rCondition.codePath!?.length > 0) {
                resourceIdentifier = get(resource, rCondition.codePath!);
              }

              // check if the identifier matches with the card
              if (
                resourceIdentifier != undefined &&
                rCondition.code != undefined
              ) {
                if (
                  rCondition.code instanceof CodedValue &&
                  resourceIdentifier instanceof CodedValue
                ) {
                  const cv = rCondition.code as CodedValue;
                  matches &&= resourceIdentifier.code == cv.code;
                } else if (typeof rCondition.code == 'number') {
                  matches &&= true;
                } else {
                  matches = false;
                }
              }

              matches = true;
            }
          }

          if (matches) {
            urlCommands = rCondition;
          }
        });

        return urlCommands;
      } else {
        return undefined;
      }
    }

    /**
     * Try to solve the URL matching each action of the suggestion.
     *
     * If the suggestion has no action no URL is matched
     *
     * @param suggestion
     * @returns
     */
    public matchFn(a: Action): EnrichResourceFn | undefined {
      if (a) {
        const rAction = this.matchesOne(a);
        if (rAction) return this.validPaths.get(rAction)?.fn;
      }
      return undefined;
    }

    /**
     * Try to solve the URL matching each action of the suggestion.
     *
     * If the suggestion has no action no URL is matched
     *
     * @param suggestion
     * @returns
     */
    public matchUrl(s: Suggestion): string[] | undefined {
      if (s && s.actions) {
        const rAction = this.matchesAll(s.actions);
        if (rAction) return this.validPaths.get(rAction)?.urls;
      }
      return undefined;
    }
  }
}
