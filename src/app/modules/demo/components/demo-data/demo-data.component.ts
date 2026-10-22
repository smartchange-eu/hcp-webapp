import { Component, OnInit, ViewChild } from '@angular/core';
import { Encounter, Patient } from '@eng-it4h/heart-ui-model';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { DemoAdministrationService } from '@modules/demo/demo-administration.service';
import { DemoType, ProfileType } from '@modules/demo/demo.config';
import { LocaleService } from '@modules/service/services/locale.service';

@Component({
  selector: 'heart-demo-data',
  templateUrl: './demo-data.component.html',
  styleUrls: ['./demo-data.component.scss'],
})
export class DemoDataComponent implements OnInit {
  protected lang: string;

  protected loading: boolean = true;
  protected saving: boolean = false;

  protected patient?: Patient;

  encounter?: Encounter;

  constructor(
    private demoService: DemoAdministrationService,
    private _localeService: LocaleService,
    private _snackBarService: SnackBarService,
  ) {
    this.lang = this._localeService.currentLanguage;
  }

  async ngOnInit(): Promise<void> {
    this.demoService.ready.subscribe((ready) => {
      if (ready) {
        this.patient = this.demoService.patient;

        this.loading = false;
      }
    });
  }

  async createProfile(arg0: DemoType, type: ProfileType) {
    this.saving = true;
    try {
      this.demoService.createProfile(arg0, type);
      this.saving = false;
      this.showMessage('Profile saved!', 'snack-success');
    } catch (err) {
      console.error(err);
      this.saving = false;
      this.showMessage('Profile error', 'snack-error');
    }
  }

  async createAll(arg0: DemoType, type: ProfileType) {
    await this.demoService.generateDemoData(arg0, type);
    this.showMessage('All data created!', 'snack-success');
  }

  async createEncounter(arg0: DemoType, type: ProfileType) {
    this.saving = true;
    try {
      this.encounter = await this.demoService.createFullEncounter(arg0, type);
      this.saving = false;
      this.showMessage('Encounter saved!', 'snack-success');
    } catch (err) {
      console.error(err);
      this.saving = false;
      this.showMessage('Encounter error', 'snack-error');
    }
  }
  async createInitialRisk() {
    try {
      const level = await this.demoService.getInitialRisk();
      this.saving = false;
      this.showMessage(`Initial risk saved! Level: ${level}`, 'snack-success');
    } catch (err) {
      console.error(err);
      this.saving = false;
      this.showMessage('Initial risk error', 'snack-error');
    }
  }

  showMessage(msg: string, type: 'snack-success' | 'snack-error') {
    this._snackBarService.openSnackBar(msg, undefined, 4000, type); // 'accent'
  }
}
