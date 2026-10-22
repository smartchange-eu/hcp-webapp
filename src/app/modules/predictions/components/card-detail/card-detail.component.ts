import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Card } from '@eng-it4h/heart-ui-cdss';
import {
  ConfirmationDialogComponent,
  SnackBarService,
} from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { SuggestionService } from '@modules/service/services/suggestion.service';

@Component({
  selector: 'heart-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
})
export class CardDetailComponent implements OnInit {
  private debug = environment.debug || false;

  @Input() card?: Card;
  @Input() lang?: string;
  @Input() visualExplainerUrl?: string;
  private DIALOG_WIDTH = '800px';

  protected changingStatus: boolean = false;

  protected showFeaturesPanel: boolean = false;

  constructor(
    private _suggestionService: SuggestionService,
    private dialog: MatDialog,
    private _snackbarService: SnackBarService
  ) {}

  ngOnInit(): void {}

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

    if (this.card?.suggestions && this.card.suggestions.length > 0) {
      return !this.card.suggestions.some((s) => s.accepted);
    }

    return toRet;
  }

  protected confirmChoices() {
    const acc = this.card?.suggestions?.filter((s) => s.accepted).length ?? 0;
    if (
      acc > 0 ||
      this.card?.suggestions == undefined ||
      this.card?.suggestions.length == 0
    ) {
      this._suggestionService.closeCard(this.card!).then(() => {
        //snackbar
        this._snackbarService.openSnackBar(
          'cdss-details.closed.success.snackbar',
          undefined,
          4000,
          'snack-success'
        ); // 'accent'
      });
    } else {
      console.error('IMPOSSIBLE TO CLOSE A CARD IN THIS STATUS');
    }
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
          if (this.debug) {
            console.log(
              'SelectedReason: ' +
                res.selectedReason?.display +
                ' - Notes: ' +
                res.notes
            );
          }
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
}
