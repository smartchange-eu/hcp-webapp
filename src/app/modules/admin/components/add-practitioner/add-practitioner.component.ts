import { CodedValueConfig } from '@config/service/coded-values.config';
import { SnackBarService } from '@eng-it4h/heart-ui-utils';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  Gender,
  Organization,
  User,
  CodedValue,
  Role,
  Language,
} from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { NewHcpFormComponent } from '@eng-it4h/heart-ui-user';
import { LocaleService } from '@modules/service/services/locale.service';
import { AsyncValidatorFn } from '@angular/forms';
import { UserAdministrationService } from '@modules/service/services/user-administration.service';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { Subject, takeUntil } from 'rxjs';
import { LanguageConfig } from '@config/language.conf';

@Component({
  selector: 'app-add-practitioner',
  templateUrl: './add-practitioner.component.html',
  styleUrls: ['./add-practitioner.component.scss'],
})
export class AddPractitionerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private debug = environment.debug || false;

  protected existanceValidator: AsyncValidatorFn;
  public validationPwd: string;
  public validationTxt: string;
  protected readonly languages;
  public lang: string;
  public loading: boolean = true;
  protected demo = !environment.production || environment.testEnv == 'true';

  @ViewChild(NewHcpFormComponent) child?: NewHcpFormComponent;
  protected isDemoUser = false;
  public readonly genderValues = [
    ...CodedValueConfig.genderValues,
    Gender.unknown,
  ];

  public orgsValues: Organization[] = [];

  constructor(
    private _localService: LocaleService,
    private _snackBar: SnackBarService,
    private _pms: UserAdministrationService,
    private _databus: DataBusService,
  ) {
    this.lang = this._localService.currentLanguage.toString();
    this.existanceValidator = this._pms.existanceValidator;
    this.validationPwd = this._pms.validationPwd;
    this.validationTxt = this._pms.validationText;

    const l = [...LanguageConfig.SUPPORTED_LANGUAGES.keys()];
    this.languages = Language.getSubset(l);
  }

  ngOnInit(): void {
    this._localService.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.lang = res.lang;
      });
    this._databus.allOrganizations$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pl) => {
        this.orgsValues = pl;
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
  public readonly roles: CodedValue[] = [
    new CodedValue(
      'role-system',
      Role.PRACTITIONER.toString(),
      'user.type.practitioner',
    ),
    new CodedValue('role-system', 'teacher', 'user.type.teacher'),
    // new CodedValue('role-system', Role.NURSE.toString(), 'user.type.nurse'),
    // new CodedValue('role-system', UserType.GUEST, 'user.type.guest'),
  ];

  public async storeUser(user: User): Promise<void> {
    try {
      if (this.isDemoUser) {
        user.emailVerified = true;
        user.temporaryPassword = false;
      }
      // 1. call backend
      await this._pms.storeHCP(user);
      this._snackBar.openSnackBar(
        'admin.user.add.success.snack',
        undefined,
        4000,
        'snack-success',
      ); // 'accent'
      this.child?.correctlySaved();
    } catch (err) {
      if (this.debug) {
        console.error(err);
      }
      this._snackBar.openSnackBar(
        'admin.user.add.error.snack',
        undefined,
        4000,
        'snack-error',
      ); // 'warn''
      this.child?.reValidateForm();
    }
  }
}
