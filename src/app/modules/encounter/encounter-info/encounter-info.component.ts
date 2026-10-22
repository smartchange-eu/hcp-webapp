import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ClinicalNote,
  Encounter,
  EncounterQuestionnaire,
  GenericQuantitativeFormStructure,
  GenericQuantitativeMeasure,
  QuestionnaireResponse,
} from '@eng-it4h/heart-ui-model';
import { LocaleService } from '@modules/service/services/locale.service';
import { EncounterService } from '../encounter.service';
import { Subject, takeUntil } from 'rxjs';
import lab_conf from '@config/forms/lab-results-sc.json'; // configuration file - customizable the file structure
import pe_conf from '@config/forms/phys-exam-sc.json'; // configuration file - customizable the file structure
import { SnackBarService } from '@eng-it4h/heart-ui-utils';

export class Structure {
  structure?: GenericQuantitativeFormStructure;
}

@Component({
  selector: 'heart-encounter-info',
  templateUrl: './encounter-info.component.html',
  styleUrls: ['./encounter-info.component.scss'],
})
export class EncounterInfoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  protected lang: string;
  protected isActiveEncounter?: boolean;
  protected currentEncounter?: Encounter;

  private static readonly peConf: any = pe_conf;
  private static readonly labConf: any = lab_conf;
  private readonly HIST = EncounterQuestionnaire.HEALTH_HISTORY;
  private readonly LIFEST = EncounterQuestionnaire.LIFESTYLE;
  protected loading = true;

  protected encounterNotes: ClinicalNote = new ClinicalNote();

  protected pe: GenericQuantitativeFormStructure =
    EncounterInfoComponent.peConf;
  protected lab: GenericQuantitativeFormStructure =
    EncounterInfoComponent.labConf;

  protected history: QuestionnaireResponse | undefined;
  protected lifeStyle: QuestionnaireResponse | undefined;
  protected alreadyCollected: GenericQuantitativeMeasure[] = [];

  protected notesText: string = '';
  public constructor(
    private _localeService: LocaleService,
    private _episodeService: EncounterService,
    private _snackBar: SnackBarService,
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this._episodeService
      .observeCurrentCompleteEncounter()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.loading = true;
        this.currentEncounter = res;
        if (res) {
          this.isActiveEncounter = this._episodeService.isEditable(
            this.currentEncounter,
          );
          this.history = this.currentEncounter?.getQuestionnaire(this.HIST);
          this.lifeStyle = this.currentEncounter?.getQuestionnaire(this.LIFEST);
          this.alreadyCollected =
            this.currentEncounter?.physical_examination
              ?.filter((m) => m instanceof GenericQuantitativeMeasure)
              .map((mm) => mm as GenericQuantitativeMeasure) ?? [];
          this.encounterNotes = this._episodeService.getNotes(res);
          this.notesText = this.encounterNotes.body ?? '';
        } else {
          this.isActiveEncounter = false;
          this.history = undefined;
          this.lifeStyle = undefined;
          this.alreadyCollected = [];
        }
        this.loading = false;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
            'snack-success',
          );
        })
        .catch(() => {
          this._snackBar.openSnackBar(
            'episode.snack.notes-error.msg',
            undefined,
            4000,
            'snack-error',
          );
        });
    }
  }
}
