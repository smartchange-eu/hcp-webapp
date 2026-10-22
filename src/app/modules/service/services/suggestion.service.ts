import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  UrlCreationOptions,
  UrlTree,
} from '@angular/router';
import {
  Card,
  HeartUiCdssService,
  ModelFeature,
  Suggestion,
} from '@eng-it4h/heart-ui-cdss';
import { DataConverterFactory } from '@eng-it4h/heart-ui-connector';
import { CodedValue, Patient } from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { UpdateRiskHook } from '@modules/predictions/hooks/update-risk.hook';
import { DataBusService } from '@modules/service/services/data-bus.service';
import {
  BehaviorSubject,
  Observable,
  Subject,
  from,
  lastValueFrom,
  map,
} from 'rxjs';
import { ActionsService } from './actions.service';
import { LocaleService } from './locale.service';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { LogEvent } from './logging.decorator';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';

@Injectable({
  providedIn: 'root',
})
export class SuggestionService {
  private debug = environment.debug;

  private readonly cardsSubject: BehaviorSubject<Card[]> = new BehaviorSubject<
    Card[]
  >([]);

  // subscriber to notify that badge toolbar should be update
  public readonly resetObs$: Subject<void> = new Subject();

  // subscriber to notify that the card list (and so its count) has changed
  // public readonly refreshCardCount$: Subject<void> = new Subject();

  public currentCardSubject$: BehaviorSubject<Card | undefined> =
    new BehaviorSubject<Card | undefined>(undefined);
  public currentSuggestionSubject$: BehaviorSubject<Suggestion | undefined> =
    new BehaviorSubject<Suggestion | undefined>(undefined);

  constructor(
    private _brokerCDSS: HeartUiCdssService,
    private databus: DataBusService,
    _dataConverterFactory: DataConverterFactory,
    private _router: Router,
    private _snackbarService: SnackBarService,
    private _localeService: LocaleService,
    private _actionService: ActionsService
  ) {
    this.databus.currentPatient$.subscribe((patient) => {
      if (patient) {
        this.forceRetrieveCards(patient);
      } else {
        this.clearAllCards();
      }
    });
  }

  public get cards$() {
    return this.cardsSubject.asObservable();
  }

  public get cards() {
    return this.cardsSubject.value;
  }

  public get latestCard() {
    return this.cardsSubject.value?.at(0);
  }
  /**
   * Retrieve all cards for a specific patient.
   *
   * This method has no sideeffect on the SuggestionService
   *
   * @param patient
   * @returns
   */
  public async cardHistory(patient: Patient): Promise<Card[] | undefined> {
    if (environment.xcdsServiceEnabled) {
      const request = this._brokerCDSS.getCardsByPatient(patient.id + '').pipe(
        map((currentCards) => {
          currentCards.forEach((c) => {
            this.addUnitToCard(c);
          });

          return currentCards;
        })
      );

      return lastValueFrom(request);
    }
    return undefined;
  }

  private addUnitsToFeatures(mf?: ModelFeature[]) {
    mf?.forEach((f) => {
      f.unit = CodedValueConfig.featureUnits.get(f.key.code) ?? f.unit;
    });
  }

  private addUnitToCard(card: Card) {
    card.suggestions?.forEach((s) => {
      this.addUnitsToFeatures(s.counterfactualExplanation?.current.features);
      s.counterfactualExplanation?.forecasting?.forEach((f) => {
        this.addUnitsToFeatures(f.features);
      });
      s.counterfactualExplanation?.counterfactuals?.forEach((cf) => {
        this.addUnitsToFeatures(cf.overall?.features);
        cf.forecasting.forEach((f) => {
          this.addUnitsToFeatures(f.features);
        });
      });
    });
  }

  /**
   * Retrieve all current cards for a specific patient.
   *
   * The cards are also appended to the 'cards' observable of this service
   *
   * @param patient
   * @returns
   */
  private async forceRetrieveCards(
    patient?: Patient
  ): Promise<Card[] | undefined> {
    if (environment.xcdsServiceEnabled) {
      // reset service status
      this.clearAllCards();

      if (patient) {
        // pull existing cards from the XCDS
        if (this.debug) {
          console.debug(
            `Connecting the CDSSBroker to getCardsByPatient for Patient: ${patient.id}`
          );
        }

        const request = this._brokerCDSS
          .getCardsByPatient(patient.id + '')
          .pipe(
            map((currentCards) => {
              // updates the cards of the 'global' BehaviorSubject
              currentCards = currentCards.filter(
                (c) =>
                  c.suggestions &&
                  c.suggestions?.length > 0 &&
                  c.suggestions.some((s) => s.counterfactualExplanation)
              );
              currentCards.forEach((c) => {
                this.addUnitToCard(c);
              });
              currentCards.sort(
                (a, b) =>
                  (b.createdOn?.getTime() ?? 0) - (a.createdOn?.getTime() ?? 0)
              );
              this.cardsSubject.next(currentCards);
              // this.refreshCardCount$.next();
              if (this.debug) {
                console.debug(
                  `forceRetrieveCards GOT ${currentCards?.length} CARDs.`
                );
              }
              return currentCards;
            })
          );

        return lastValueFrom(request);
      } else {
        return undefined;
      }
    }
    return undefined;
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_UPDATED_RISK)
  public updateRiskSuggestions(): void {
    const p: Patient = this.databus.currentPatient!;

    // trigger the hook 'UpdateResource'
    if (this.debug) {
      console.debug(
        `Connecting the CDSSBroker to update risk cards for Patient: ${p.id}`
      );
    }
    const observable = this._brokerCDSS.updateCards(
      p.id + '',
      new UpdateRiskHook([55])
    ) as Observable<Card[]>;

    // notify that there are new cards to visualize
    observable.subscribe((cards) => {
      cards.forEach((c) => {
        this.addUnitToCard(c);
      });
      const newCards = [...(this.cardsSubject.value ?? []), ...cards].sort(
        (a, b) => (b.createdOn?.getTime() ?? 0) - (a.createdOn?.getTime() ?? 0)
      );
      // append the cards to the 'global' BehaviorSubject for the current patient
      this.cardsSubject.next(newCards);
      if (this.debug) {
        console.debug(
          `[updateRiskSuggestions] updateCards GOT ${cards?.length} NEW CARDs.`
        );
      }
    });
  }
  /**
   * Track the card that is currently being managed by the user.
   *
   * Invoking this method has a side effect of notifying any subcriber of the 'SelectedCardSubject'
   *
   * @param card
   */
  @LogEvent(USER_EVENT_CONSTANTS.USER_VIEWED_RISK)
  public selectCard(card: Card) {
    card.unseen = false;
    this.currentCardSubject$.next(card);
  }

  /**
   * Track the card that is currently being managed by the user.
   *
   * Invoking this method has a side effect of notifying any subcriber of the 'SelectedCardSubject'
   *
   * @param card
   */
  @LogEvent(USER_EVENT_CONSTANTS.USER_OPENED_EXPLANATION)
  public selectCardById(cardId: string): boolean {
    const card = this.cards.find((c) => c.uuid == cardId);
    if (card) {
      card.unseen = false;
      this.currentCardSubject$.next(card);
      return true;
    }
    return false;
  }

  /**
   * Return the subscriber for the currently selected card
   * @returns
   */
  public getSelectedCardSubject(): BehaviorSubject<Card | undefined> {
    return this.currentCardSubject$;
  }

  public getSelectedCard(): Card | undefined {
    return this.currentCardSubject$.value;
  }

  public setAllRead() {
    this.cardsSubject.value.forEach((c) => (c.unseen = false));
  }

  public selectSuggestion(s: Suggestion) {
    this.currentSuggestionSubject$.next(s);
  }

  /**
   * Return the subscriber for the currently selected suggestion
   * @returns
   */
  public getSelectedSuggestionSubject(): BehaviorSubject<
    Suggestion | undefined
  > {
    return this.currentSuggestionSubject$;
  }

  public getSelectedSuggestion(): Suggestion | undefined {
    return this.currentSuggestionSubject$.value;
  }

  public clearAllCards() {
    // this.currentCard = undefined;
    this.cardsSubject.next([]);
    this.currentCardSubject$.next(undefined); // elimina la card corrente dalla sessione
    this.currentSuggestionSubject$.next(undefined);
    this.resetObs$.next(); // resetta il badge nella toolbar
    // this.refreshCardCount$.next();
  }

  /**
   * Refuse a whole card (not only a suggestion) by providing a 'coded' motivation and a comment
   *
   * @param card
   * @param motivation
   * @param comment
   */
  @LogEvent(USER_EVENT_CONSTANTS.USER_DISMISSED_RISK)
  public refuseCard(
    card: Card,
    motivation?: CodedValue,
    comment?: string
  ): Observable<void> {
    if (this.debug) {
      console.log(
        `Refusing the whole card ${card.uuid} with ${motivation?.display}`
      );
    }

    const currentPatient = this.databus.currentPatient;
    if (currentPatient == undefined) {
      throw new Error(
        `The 'refuseCard' requires that a patient must be selected.`
      );
    }

    // invoke the broker
    const obs$: Observable<void> = this._brokerCDSS
      .refuseCard(currentPatient!.id + '', card, motivation, comment)
      .pipe(
        map(() => {
          this.cardsSubject.next(this.cardsSubject.value);
        })
      );
    return from(lastValueFrom(obs$));
  }

  /**
   * Close a card. Only card without suggestions or in status ACCEPTING can be closed/accepted
   *
   * @param card
   */
  public async closeCard(card: Card): Promise<void> {
    if (this.debug) {
      console.log(`Closing the card ${card.uuid}`);
    }

    // invoke the broker
    const currentPatient = this.databus.currentPatient;
    if (currentPatient == undefined) {
      throw new Error(
        `The 'closeCard' requires that a patient must be selected.`
      );
    }

    if (
      (card.suggestions != undefined &&
        card.suggestions.length > 0 &&
        card.status != 'accepting') ||
      (!(card.suggestions != undefined && card.suggestions.length > 0) &&
        card.status != 'new')
    ) {
      throw new Error(
        `Only new cards without suggestions or in status ACCEPTING can be closed/accepted`
      );
    }
    // invoke the broker
    const osb$: Observable<void> = this._brokerCDSS
      .closeCard(currentPatient!.id + '', card)
      .pipe(
        map(() => {
          // notify that there is a card status change
          this.cardsSubject.next(this.cardsSubject.value);

          // notify the view that there is a change in the cards
          // this.refreshCardCount$.next();
        })
      );

    return lastValueFrom(osb$);
  }

  /**
   * Hide a whole card
   *
   * @param card
   */
  public hideCard(card: Card): void {
    if (this.debug) {
      console.log(`Hiding the card ${card.uuid}`);
    }

    // invoke the broker
    const currentPatient = this.databus.currentPatient;
    if (currentPatient == undefined) {
      throw new Error(
        `The 'hideCard' requires that a patient must be selected.`
      );
    }

    // invoke the broker
    this._brokerCDSS
      .hideShowCard(currentPatient!.id + '', card, false)
      .subscribe(() => {
        // notify that there is a card status change
        this.cardsSubject.next(this.cardsSubject.value);

        // notify the view that there is a change in the cards
        // this.refreshCardCount$.next();
      });
  }

  /**
   * Show a previously hidden card
   *
   * @param card
   */
  public showCard(card: Card): void {
    if (this.debug) {
      console.log(`Showing the card ${card.uuid}`);
    }

    // invoke the broker
    const currentPatient = this.databus.currentPatient;
    if (currentPatient == undefined) {
      throw new Error(
        `The 'showCard' requires that a patient must be selected.`
      );
    }

    // invoke the broker
    this._brokerCDSS
      .hideShowCard(currentPatient!.id + '', card, true)
      .subscribe(() => {
        // notify that there is a card status change
        this.cardsSubject.next(this.cardsSubject.value);

        // notify the view that there is a change in the cards
        // this.refreshCardCount$.next();
      });
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_ACCEPTED_RISK)
  public async acceptSuggestion(
    card: Card,
    suggestion: Suggestion
  ): Promise<void> {
    if (this.debug) {
      console.log(`Accepting the suggestion ${suggestion.uuid}`);
    }

    // invoke the broker
    const currentPatient = this.databus.currentPatient;
    if (currentPatient == undefined) {
      throw new Error(
        `The 'acceptSuggestion' requires that a patient must be selected.`
      );
    }

    this._brokerCDSS
      .acceptSuggestion(currentPatient!.id + '', card, suggestion)
      .subscribe(() => {
        if (suggestion.actions && suggestion.actions?.length > 0)
          this._actionService.resolveActions(
            suggestion.actions,
            currentPatient,
            card
          );
        // notify that there is a card status change
        this.cardsSubject.next(this.cardsSubject.value);

        // as the card status may be updated as side effect of accepting a suggestion let's refresh
        // the card count too by notifyng the view that there is a change in the cards
        // this.refreshCardCount$.next();

        // TODO: RISOLVERE/INSERIRE IL NOME DELL'HCP CHE HA ACCETTATO IL SUGGERIMENTO
        if (card.status == 'accepted') {
          //snackbar
          const msg = this._localeService.translateService.instant(
            'cdss.automatic.closed.success.snackbar'
          );
          this._snackbarService.openSnackBar(
            msg,
            undefined,
            4000,
            'snack-success'
          ); // 'accent'
        }
      });
  }

  /**
   * Given a suggestion it returns the URL of the UI meant to implement the related actions.
   *
   * An important assumption is that the UI has to support all the described actions of the suggestion to resolve it
   * @param card
   * @param suggestion
   */
  public resolveURL(card: Card, suggestion: Suggestion): UrlTree | undefined {
    if (card.uuid == undefined || suggestion.uuid == undefined) {
      throw new Error(
        `Missing required UUID(s) for ${card.label} and/or ${suggestion.label}`
      );
    }

    const path: string[] | undefined = this._actionService.resolveURL(
      card,
      suggestion
    );

    if (path != undefined) {
      const navigationExtras: UrlCreationOptions = {
        queryParams: {
          card: card.uuid,
          suggestion: suggestion.uuid,
        },
      };

      return this._router.createUrlTree(path, navigationExtras);
    } else {
      return undefined;
    }
  }

  /**
   * Return a tuple with both the card and the suggestion with the actions to work with.
   *
   * @param route
   * @param includeAccepted: boolean - force the resolution also of already
   *  accepted suggestions. If false (deafult) it does not return already accepted suggestions
   * @returns
   */
  public getSuggestionFromRoute(
    route: ActivatedRoute,
    includeAccepted: boolean = false
  ): SuggestionService.ManagedSuggestion | undefined {
    const qParams = route.snapshot.queryParams;
    let res: SuggestionService.ManagedSuggestion | undefined = undefined;

    if (qParams) {
      const cardUuid: string | undefined = qParams['card'];
      const suggestionUuid: string | undefined = qParams['suggestion'];

      // only if both route parameters are available
      if (cardUuid && suggestionUuid) {
        const cards = this.cardsSubject.value;

        const card = cards.find((c) => c.uuid == cardUuid)!;
        const suggestion = card?.suggestions?.find(
          (s) => s.uuid == suggestionUuid
        )!;

        if (!suggestion.accepted || (suggestion.accepted && includeAccepted)) {
          res = { card, suggestion };
        }
      }
    }

    return res;
  }
}

export namespace SuggestionService {
  export interface ManagedSuggestion {
    card: Card;
    suggestion: Suggestion;
  }
}
