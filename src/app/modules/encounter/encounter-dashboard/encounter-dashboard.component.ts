import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  ClinicalNote,
  Encounter,
  HealthCareProfessional,
} from '@eng-it4h/heart-ui-model';
import {
  ConfirmationDialogComponent,
  SnackBarService,
} from '@eng-it4h/heart-ui-utils';

import { LocaleService } from '@modules/service/services/locale.service';
import { Step } from '@modules/stepper/step';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { EncounterService } from '../encounter.service';
import { DataBusService } from '@modules/service/services/data-bus.service';

@Component({
  selector: 'heart-encounter-dashboard',
  templateUrl: './encounter-dashboard.component.html',
  styleUrls: ['./encounter-dashboard.component.scss'],
})
export class EncounterDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected encounter?: Encounter;
  // status of the Episode (it is active if it has not been closed yet)
  protected lang: string;
  protected DIALOG_WIDTH = '800px';
  protected hcp?: HealthCareProfessional;

  steps: Step[] = [
    { title: 'episode.button.history.label', index: 0, path: 'history' },
    { title: 'episode.button.pe.label', index: 1, path: 'physical-exam' },
    { title: 'episode.button.lifestyle.label', index: 2, path: 'lifestyle' },
    { title: 'episode.button.lab.label', index: 3, path: 'lab-results' },
    { title: 'episode.button.review.label', index: 4, path: 'review' },
  ];
  protected isActiveEncounter: boolean = false;

  protected encounterNotes: ClinicalNote = new ClinicalNote();
  protected notesText: string = '';
  protected loading: boolean = true;
  protected saving: boolean = false;
  protected showNotes: boolean = true;

  constructor(
    private _localeService: LocaleService,
    private _dialog: MatDialog,
    private _router: Router,
    private _snackBar: SnackBarService,
    private _dataBusService: DataBusService,
    private _episodeService: EncounterService
  ) {
    this.lang = this._localeService.currentLanguage.toString();
    this.hcp = this._dataBusService.currentPractitioner;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.loading = true;

    // this.episode = this._dataBusService.getCurrentEpisode();
    this._localeService.translateService.onLangChange.subscribe((res) => {
      this.lang = res.lang;
    });

    this._episodeService
      .observeCurrentCompleteEncounter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.loading = true;
        this.isActiveEncounter = this._episodeService.isEditable();

        this.encounter = res;
        if (res) {
          this.encounterNotes = this._episodeService.getNotes(res);
          this.notesText = this.encounterNotes.body ?? '';
        }
        this.loading = false;
      });
  }

  saveNotes(): void {
    if (this.notesText?.trim() && this._episodeService.isEditable()) {
      this.encounterNotes.body = this.notesText;
      this._episodeService
        .saveNote(this.encounterNotes)
        .then(() => {
          this._snackBar.openSnackBar(
            'episode.snack.notes-saved.msg',
            undefined,
            4000,
            'snack-success'
          );
        })
        .catch(() => {
          this._snackBar.openSnackBar(
            'episode.snack.notes-error.msg',
            undefined,
            4000,
            'snack-error'
          );
        });
    }
  }

  onFinished(event: boolean) {
    if (event) {
      if (this.encounter!.status == 'in-progress') {
        this.closeAndBlockEpisode();
      } else {
        this._router.navigateByUrl('/web/hcp/dashboard/encounters');
      }
    }
  }

  isLast(event: boolean) {
    this.showNotes = !event;
  }

  protected closeAndBlockEpisode() {
    if (this._episodeService.canCloseEncounter()) {
      const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
        width: this.DIALOG_WIDTH,
        data: {
          title: 'blocking.confirmation.title',
          msg: 'blocking.confirmation.msg',
          closeLabel: 'answer.no.label',
          okLabel: 'answer.yes.label',
        },
      });

      dialogRef.afterClosed().subscribe((res) => {
        if (res == true) {
          // this.delete(element);
          // TODO: implementare la chiusura episodio
          console.log('[EpisodeDashboardComponent] - TO CLOSE THE EPISODE');
          this._episodeService
            .doCloseEncounter()
            .then(() => {
              return this._router
                .navigateByUrl('/web/hcp/dashboard/risk/predictions')
                .then((navigated: boolean) => {
                  if (navigated) {
                    this._snackBar.openSnackBar(
                      'episode.snack.close-success.msg',
                      undefined,
                      4000,
                      'snack-success'
                    );
                  }
                });
            })
            .catch((err: Error) => {
              // reset closingDate
              this.encounter!.closingDate = undefined;

              //snackbar e non muoverti dalla pagina
              const msg = this._localeService.translateService.instant(
                'episode.snack.close-error.msg'
              );

              this._snackBar.openSnackBar(msg, undefined, 4000, 'snack-error');
            });
        }
      });
    } else {
      const msg = this._localeService.translateService.instant(
        'episode.snack.session-error.msg'
      );

      this._snackBar.openSnackBar(msg);
    }
  }

  protected canCloseEpisode(): boolean {
    return this._episodeService.canCloseEncounter();
  }
}
