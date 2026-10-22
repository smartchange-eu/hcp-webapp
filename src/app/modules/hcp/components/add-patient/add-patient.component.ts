import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';

import { environment } from '@env/environment';

import {
  CareGiver,
  CodedValue,
  Gender,
  Role,
  User,
} from '@eng-it4h/heart-ui-model';
import { PatientAnagraphicFormComponent } from '@eng-it4h/heart-ui-patient';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';

import { LocaleService } from '@modules/service/services/locale.service';

import { Router } from '@angular/router';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { PatientService } from '@modules/service/services/patient.service';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { Subject, takeUntil } from 'rxjs';
import { CodedValueConfig } from '@config/service/coded-values.config';

@Component({
  selector: 'heart-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss'],
})
export class AddPatientComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private debug = environment.debug || false;

  protected lang: string;

  protected loading: boolean = true;
  protected saving: boolean = false;

  protected readonly genderValues: Gender[] = CodedValueConfig.genderValues;
  protected readonly relationships: CodedValue[] =
    CodedValueConfig.familyMembersRelationships;
  protected existenceValidator: AsyncValidatorFn = this._uas.existanceValidator;
  protected readonly trialGroups = CodedValueConfig.trialGroups;

  protected selectedGroup?: CodedValue;
  @ViewChild(PatientAnagraphicFormComponent)
  protected child?: PatientAnagraphicFormComponent;

  constructor(
    private _localeService: LocaleService,
    private _dataBusService: DataBusService,
    private _patientService: PatientService,
    private _uas: UserAdministrationService,
    private _router: Router
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this.selectedGroup = this.trialGroups[0];
    this.loading = false;
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  public async storeUser(
    evt: { user: User; familyMembers?: CareGiver[] } | User,
    goToDashboard: boolean
  ): Promise<void> {
    let user: User;
    let members: CareGiver[] = [];
    if (evt instanceof User) {
      user = evt;
    } else {
      user = evt.user;
      members = evt.familyMembers ?? [];
    }
    try {
      this.saving = true;
      const roles = this.selectedGroup
        ? [new Role(this.selectedGroup.code)]
        : undefined;
      const ret = await this._uas.registerUser(
        user,
        this._dataBusService.currentPractitioner,
        members,
        true,
        roles,
        true,
        this._localeService.currentLanguage
      );
      if (ret)
        if (goToDashboard) {
          this._patientService.switchCurrentPatient(ret);
          this._router.navigateByUrl('/web/hcp/dashboard');
        } else {
          this.child?.correctlySaved();
        }
    } catch (err) {
      if (this.debug) {
        console.error(err);
      }
    } finally {
      this.saving = false;
    }
  }
}
