import { compareDesc } from 'date-fns';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Card } from '@eng-it4h/heart-ui-cdss';
import { LocaleService } from '@modules/service/services/locale.service';
import { SuggestionService } from '@modules/service/services/suggestion.service';
import { unionBy } from 'lodash-es';
import { Subject, takeUntil } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { environment } from '@env/environment';

@Component({
  selector: 'heart-suggestions-list',
  templateUrl: './suggestions-list.component.html',
  styleUrls: ['./suggestions-list.component.scss'],
})
export class SuggestionsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('drawer') public drawer?: MatDrawer;
  protected cards: Card[] = [];
  protected filteredCards: Card[] = [];
  protected selectedCard?: Card;
  public opened: boolean = true;
  protected lang: string;
  public loading: boolean = false;
  protected noCards = false;
  protected showAll: boolean = false;
  protected veUrl?: string;

  constructor(
    private _suggestionService: SuggestionService,
    private _localeService: LocaleService,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    if (
      environment.visualExplainer &&
      environment.visualExplainerUrl.length > 0
    ) {
      this.veUrl = environment.visualExplainerUrl;
    }
  }

  ngOnInit(): void {
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this._suggestionService.cards$
      .pipe(takeUntil(this.destroy$))
      .subscribe((c: Card[]) => {
        this.loading = true;
        // lodash, in case of matching items, takes the one of the first param
        var newCards = unionBy(c, this.cards);
        this.cards?.splice(0, this.cards.length, ...newCards);
        if (!this.cards || this.cards.length == 0) {
          // this.opened = false;
          this.noCards = true;
        }
        this.cards?.sort((a, b) =>
          compareDesc(a.createdOn ?? 0, b.createdOn ?? 0),
        );
        this.filteredCards = this.cards?.filter((c) => {
          return c.status == 'new' || c.status == 'accepting';
        });
        if (this.filteredCards.length == 0) {
          this.showAll = true;
        }
        const intialCard = this._suggestionService.getSelectedCard();
        if (intialCard) {
          // this.opened = false;
          this.internallyUpdateSelected(intialCard);
        }

        this.loading = false;
      });

    this._suggestionService
      .getSelectedCardSubject()
      .pipe(takeUntil(this.destroy$))
      .subscribe((c: Card | undefined) => {
        if (c) this.internallyUpdateSelected(c);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateRisk() {
    this._suggestionService.updateRiskSuggestions();
  }

  public toggleFiler(value: MatSlideToggleChange): void {
    this.showAll = value.checked;
  }

  get selectedCards() {
    return this.showAll ? this.cards : this.filteredCards;
  }

  protected hideAndShowCard(event: { card: Card; hidden: boolean }): void {
    if (event.hidden) {
      this._suggestionService.hideCard(event.card);
    } else {
      this._suggestionService.showCard(event.card);
    }
  }

  internallyUpdateSelected(card: Card) {
    if (card) this.noCards = false;
    this.loading = true;
    // this.drawer?.close();
    this.selectedCard = card;
    this.cards?.forEach((c) => {
      c.selected = false;
    });
    card.selected = true;
    if (!(card.status == 'new' || card.status == 'accepting'))
      this.showAll = true;
    this.loading = false;
  }

  protected selectCard(card: Card): void {
    this._suggestionService.selectCard(card);
  }
}
