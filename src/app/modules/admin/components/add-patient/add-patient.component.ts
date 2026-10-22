import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';

import { environment } from '@env/environment';

import {
  CareGiver,
  CodedValue,
  Organization,
  Role,
  User,
} from '@eng-it4h/heart-ui-model';
import { PatientAnagraphicFormComponent } from '@eng-it4h/heart-ui-patient';
import { LocaleService } from '@modules/service/services/locale.service';

import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { Subject, takeUntil } from 'rxjs';
import { CodedValueConfig } from '@config/service/coded-values.config';
import { DemoAdministrationService } from '@modules/demo/demo-administration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { DemoType, ProfileType } from '@modules/demo/demo.config';

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

  protected orgs: Organization[] = [];
  protected selectedGroup?: CodedValue;

  protected readonly genderValues = CodedValueConfig.genderValues;
  protected readonly relationships =
    CodedValueConfig.familyMembersRelationships;
  protected readonly trialGroups = CodedValueConfig.trialGroups;

  @ViewChild(PatientAnagraphicFormComponent)
  protected child?: PatientAnagraphicFormComponent;
  private _demo?: DemoAdministrationService;
  protected existenceValidator: AsyncValidatorFn = this._pms.existanceValidator;
  protected saving: boolean = false;
  protected demo = !environment.production || environment.testEnv == 'true';
  protected isDemoUser = false;
  protected demoLevel: DemoType = 'mod';
  protected demoGroup: ProfileType = 'hepa';

  constructor(
    private _localeService: LocaleService,
    private _databus: DataBusService,
    private _pms: UserAdministrationService,
    private r: ActivatedRoute,
    private router: Router,
    private _snackBarService: SnackBarService,
  ) {
    if (this.demo) {
      this._demo = inject(DemoAdministrationService);
    }
    this.lang = this._localeService.currentLanguage.toString();
  }

  ngOnInit(): void {
    this.selectedGroup = this.trialGroups[0];
    this._localeService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this._databus.allOrganizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pl) => {
        this.orgs = pl;
      });
    this._databus.administrativeDataReady$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async storeUser(
    evt: { user: User; familyMembers?: CareGiver[] } | User,
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
      if (this.isDemoUser) {
        user.emailVerified = true;
        user.temporaryPassword = false;
      }
      const roles = this.selectedGroup
        ? [new Role(this.selectedGroup.code)]
        : undefined;
      const ret = await this._pms.registerUser(
        user,
        undefined,
        members,
        this.isDemoUser,
        roles,
        !this.isDemoUser,
        this._localeService.currentLanguage,
      );
      if (ret) this.child?.correctlySaved();
    } catch (err) {
      if (this.debug) {
        console.error(err);
      }
    } finally {
      this.saving = false;
    }
  }

  public async storeUserAndOpenDemo(
    evt: { user: User; familyMembers?: CareGiver[] } | User,
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
      user.emailVerified = true;
      user.temporaryPassword = false;
      const ret = await this._pms.registerUser(
        user,
        undefined,
        members,
        true,
        roles,
        false,
        this._localeService.currentLanguage,
        true,
      );
      if (ret) {
        this.child?.correctlySaved();
        if (this._demo) {
          this._demo.patient = ret;
          await this._demo
            .generateDemoData(this.demoLevel, this.demoGroup)
            .then(() => {
              this.showMessage(
                'Demo data generated successfully',
                'snack-success',
              );
              console.log('Demo data generated successfully');
            })
            .catch((err) => {
              if (this.debug) {
                this.showMessage('Error generating demo data', 'snack-error');
                console.error('Error generating demo data', err);
              }
            });
        }
      }
    } catch (err) {
      if (this.debug) {
        console.error(err);
      }
    } finally {
      this.saving = false;
    }
  }

  showMessage(msg: string, type: 'snack-success' | 'snack-error') {
    this._snackBarService.openSnackBar(msg, undefined, 4000, type); // 'accent'
  }
}
