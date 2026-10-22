import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';

import { environment } from '@env/environment';

import { CareGiver, CodedValue, Role, User } from '@eng-it4h/heart-ui-model';
import { PatientAnagraphicFormComponent } from '@eng-it4h/heart-ui-patient';

import { CodedValueConfig } from '@config/service/coded-values.config';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { LocaleService } from '@modules/service/services/locale.service';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { Subject, takeUntil } from 'rxjs';

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

  protected selectedGroup?: CodedValue;

  protected readonly genderValues = CodedValueConfig.genderValues;
  protected readonly relationships =
    CodedValueConfig.familyMembersRelationships;
  protected readonly trialGroups = CodedValueConfig.trialGroups;

  @ViewChild(PatientAnagraphicFormComponent)
  protected child?: PatientAnagraphicFormComponent;

  protected existenceValidator: AsyncValidatorFn =
    this._userAdminService.existanceValidator;
  protected saving: boolean = false;

  constructor(
    private _localeService: LocaleService,
    private _databus: DataBusService,
    private _userAdminService: UserAdministrationService
  ) {
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this.selectedGroup = this.trialGroups[0];
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this.loading = false;
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
      const ret = await this._userAdminService.registerUser(
        user,
        this._databus.currentPractitioner,
        members,
        false,
        roles,
        true,
        this._localeService.currentLanguage
      );
      if (ret) {
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
