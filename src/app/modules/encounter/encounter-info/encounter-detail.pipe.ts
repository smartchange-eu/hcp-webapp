import { Pipe, PipeTransform } from '@angular/core';
import { Encounter, EncounterQuestionnaire } from '@eng-it4h/heart-ui-model';
import { LocaleService } from '@modules/service/services/locale.service';

@Pipe({
  name: 'encounterDetail',
})
export class EncounterDetailPipe implements PipeTransform {
  private SEPARATOR = ', ';
  private FISIO_KEY = 'episode.button.anamnesis-fisio.label';
  private PROX_KEY = 'episode.button.anamnesis-prox.label';
  private REMOTE_KEY = 'episode.button.anamnesis-remote.label';
  private FAM_KEY = 'episode.button.anamnesis-fam.label';
  private OBJ_KEY = 'episode.button.obj.label';
  private DIAG_KEY = 'episode.button.diagnosis.label';
  private EXAMS_KEY = 'episode.button.exams.label';
  private THER_KEY = 'episode.button.therapies.label';
  private REPORT_KEY = 'episode.button.reports.label';
  private ADMIN_KEY = 'episode.button.administered.label';
  private PROC_KEY = 'episode.button.procedures.label';

  constructor(private _localeService: LocaleService) {}

  transform(value: Encounter, ...args: unknown[]): string {
    let toRet: string = '';
    if (value) {
      if (
        value.getQuestionnaire(
          EncounterQuestionnaire.PATIENT_PHYSIOLOGICAL_HISTORY
        )
      ) {
        toRet +=
          this._localeService.translateService.instant(this.FISIO_KEY) +
          this.SEPARATOR;
      }
      if (value.getQuestionnaire(EncounterQuestionnaire.FAMILY_ANAMNESIS)) {
        toRet +=
          this._localeService.translateService.instant(this.FAM_KEY) +
          this.SEPARATOR;
      }
      if (
        value.getQuestionnaire(
          EncounterQuestionnaire.PATIENT_SHORT_TERM_HISTORY
        )
      ) {
        toRet +=
          this._localeService.translateService.instant(this.PROX_KEY) +
          this.SEPARATOR;
      }
      if (value.getQuestionnaire(EncounterQuestionnaire.REMOTE_ANAMNESIS)) {
        toRet +=
          this._localeService.translateService.instant(this.REMOTE_KEY) +
          this.SEPARATOR;
      }
      if (value.administration) {
        toRet +=
          this._localeService.translateService.instant(this.ADMIN_KEY) +
          this.SEPARATOR;
      }
      if (value.physical_examination) {
        toRet +=
          this._localeService.translateService.instant(this.OBJ_KEY) +
          this.SEPARATOR;
      }
      if (value.exam_prescr) {
        toRet +=
          this._localeService.translateService.instant(this.EXAMS_KEY) +
          this.SEPARATOR;
      }
      if (value.therapy_prescr) {
        toRet +=
          this._localeService.translateService.instant(this.THER_KEY) +
          this.SEPARATOR;
      }
      if (value.procedures) {
        toRet +=
          this._localeService.translateService.instant(this.PROC_KEY) +
          this.SEPARATOR;
      }
      if (value.diagn_report) {
        toRet +=
          this._localeService.translateService.instant(this.REPORT_KEY) +
          this.SEPARATOR;
      }
      if (value.diagnosis) {
        toRet +=
          this._localeService.translateService.instant(this.DIAG_KEY) +
          this.SEPARATOR;
      }
      if (toRet.length > 0) {
        toRet = toRet.substring(0, toRet.length - 2);
      }
    }
    return toRet;
  }
}
