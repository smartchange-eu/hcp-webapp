import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Action, Card, Suggestion } from '@eng-it4h/heart-ui-cdss';
import { Risk } from '@eng-it4h/heart-ui-model';
import {
  ConfirmationDialogComponent,
  SnackBarService,
} from '@eng-it4h/heart-ui-utils';
import { SuggestionService } from '@modules/service/services/suggestion.service';

@Component({
  selector: 'heart-suggestion-detail',
  templateUrl: './suggestion-detail.component.html',
  styleUrls: ['./suggestion-detail.component.scss'],
})
export class SuggestionDetailComponent implements OnInit {
  @Input() suggestion?: Suggestion;
  @Input() card?: Card;
  @Input() lang!: string;
  @Input() visualExplainerUrl?: string;

  private DIALOG_WIDTH = '800px';
  protected risks: Risk[] = [];
  protected loading: boolean = false;
  protected changingStatus: boolean = false;

  constructor(
    private dialog: MatDialog,
    private _suggestionService: SuggestionService,
    private _snackbarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    if (this.suggestion) {
      this.risks =
        this.suggestion.actions
          ?.filter((a: Action) => a.resource instanceof Risk)
          .map((a: Action) => a.resource as Risk) || [];
    }

    this.loading = false;
  }

  // se esistono suggerimenti ma non ho accettato nulla non posso premere su Done
  toDisableDoneButton(): boolean {
    if (this.changingStatus) {
      return this.changingStatus;
    }
    let toRet = false;

    if (!this.card) {
      return true;
    }

    const isOpen = this.card.status == 'new' || this.card.status == 'accepting';

    if (!isOpen) {
      return true;
    }

    // if (this.card?.suggestions && this.card.suggestions.length > 0) {
    //   return !this.card.suggestions.some((s) => s.accepted);
    // }

    return toRet;
  }

  // se ci sono suggerimenti già accettati non posso più rifiutare la card
  toDisableRefuseButton(): boolean {
    if (this.changingStatus) {
      return this.changingStatus;
    }
    let toRet = false;
    if (this.card?.suggestions && this.card.suggestions.length > 0) {
      return this.card.suggestions.some((s) => s.accepted);
    }
    return toRet;
  }

  protected refuseCard(): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'suggestion.refuse-all.confirmation.title',
          // msg: this.card!.summary,
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes-refuse-all.label',
          reasons: this.card?.possibleOverrideReasons,
          showOverriddenNotes: true,
          lang: this.lang,
        },
      })
      .afterClosed()
      // tslint:disable-next-line: deprecation
      .subscribe((res) => {
        if (res) {
          this.changingStatus = true;
          this._suggestionService
            .refuseCard(this.card!, res.selectedReason, res.notes)
            .subscribe({
              error: (err) => {
                this.changingStatus = false;
                console.error('HTTP Error', err);
                this._snackbarService.openSnackBar(
                  'cdss-details.error.snackbar',
                  undefined,
                  8000,
                  'snack-error'
                ); // 'accent'
              },
              complete: () => {
                this.changingStatus = false;
                //snackbar
                this._snackbarService.openSnackBar(
                  'cdss-details.refused.success.snackbar',
                  undefined,
                  4000,
                  'snack-success'
                ); // 'accent'
              },
            });
        }
      });
  }
  protected acceptSuggestion(): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'suggestion.accept-risk.confirmation.title',
          msg: 'suggestion.accept-risk.confirmation.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      })
      .afterClosed()
      // tslint:disable-next-line: deprecation
      .subscribe((res) => {
        if (res) {
          this.changingStatus = true;
          this._suggestionService
            .acceptSuggestion(this.card!, this.suggestion!)
            .then(() => {
              this.changingStatus = false;
              //snackbar
              this._snackbarService.openSnackBar(
                'cdss-details.refused.success.snackbar',
                undefined,
                4000,
                'snack-success'
              ); // 'accent'
            })
            .catch((err) => {
              this.changingStatus = false;
              console.error('HTTP Error', err);
              this._snackbarService.openSnackBar(
                'cdss-details.error.snackbar',
                undefined,
                8000,
                'snack-error'
              ); // 'accent'
            });
        }
      });
  }
}
