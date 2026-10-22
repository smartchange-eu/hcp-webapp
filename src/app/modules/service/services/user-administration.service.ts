import { addDays } from 'date-fns';
import { Injectable } from '@angular/core';
import { AsyncValidatorFn } from '@angular/forms';
import { LanguageConfig } from '@config/language.conf';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  CareGiver,
  CareTeam,
  CareTeamStatus,
  CodedValue,
  CounsellingPrescription,
  HealthCareProfessional,
  Locale,
  Organization,
  Patient,
  PersonAddress,
  PersonRole,
  Plan,
  Role,
  Trial,
  TrialSubject,
  User,
  PlanDefinition,
  Goal,
} from '@eng-it4h/heart-ui-model';
import {
  PasswordGeneratorUtils,
  SnackBarService,
  ValidationConfig,
} from '@eng-it4h/heart-ui-utils';
import { environment } from '@env/environment';
import { lastValueFrom } from 'rxjs';
import { CodedValueConfig } from '../../../config/service/coded-values.config';
import { PilotRestControllerService } from '../../backend-api/openapi';
import { AppointmentsService } from './appointments.service';
import { DataBusService } from './data-bus.service';
import { UserService } from './user.service';
import { validateUsernameAvailability } from './validators/availability.validator';

type REGISTRATION_ERRORS =
  | 'no.org'
  | 'no.id'
  | 'care-team.create'
  | 'family-members.create'
  | 'study-role.create'
  | 'welcome-email.create'
  | 'default-plan.create';
@Injectable({
  providedIn: 'root',
})
export class UserAdministrationService {
  private debug = environment.debug || false;

  private _existanceValidator: AsyncValidatorFn = validateUsernameAvailability(
    this._backendService,
  );

  private readonly STRING_SEPARATOR = '- ';
  private _validationPwd = ValidationConfig.pwdValidationPattern;
  private _validationText = ValidationConfig.pwdValidationPatternTextArray.join(
    this.STRING_SEPARATOR,
  );

  private _familyCache: Map<number, CareGiver[]> = new Map<
    number,
    CareGiver[]
  >();
  private _careTeamCache: Map<number, CareTeam> = new Map<number, CareTeam>();
  private _trialGroupCache: Map<number, TrialSubject> = new Map<
    number,
    TrialSubject
  >();

  private study?: Trial;
  private defaultPlan?: PlanDefinition;
  constructor(
    private _api: PilotRestControllerService,
    private _backendService: HeartUiConnectorService,
    private _userService: UserService,
    private _dataBus: DataBusService,
    private _snackbar: SnackBarService,
    private _apptService: AppointmentsService,
  ) {
    this._api.basePath = environment.apiUrl;
    this.init();
  }
  // GETTERS
  public get validationPwd() {
    return this._validationPwd;
  }

  public get validationText() {
    return this._validationText;
  }

  public get existanceValidator(): AsyncValidatorFn {
    return this._existanceValidator;
  }

  public async init(): Promise<void> {
    try {
      this.study = (
        await this._backendService.trialConnector.getStudyRefByName(
          CodedValueConfig.studyName,
        )
      )?.at(0);

      const plans =
        await this._backendService.carePlanConnector.searchPlanDefinitions();
      if (plans) {
        this.defaultPlan = plans.find(
          (p) => p.focus?.code === CodedValueConfig.defaultPlanFocus.code,
        );
      }
    } catch (err) {
      console.error(err);
    }
    this._dataBus.currentUser$.subscribe((user) => {
      if (user) {
        this.reloadAdministrativeData(true, true, true)
          .then(() => {
            if (this.debug) console.log(`Info: patients data loaded`);
          })
          .catch((err) => {
            if (this.debug) console.error(`Error: ` + err);
            this._snackbar.openSnackBar(
              'hcp-home.loading.error',
              undefined,
              4000,
              'snack-error',
            );
          })
          .finally(() => {
            this._dataBus.administrativeDataReady = true;
          });
      } else {
        this._dataBus.allOrganizations = [];
        this._dataBus.appointmmentList = [];
        this._dataBus.trialList = [];
        this._dataBus.allCounsellingRequests = [];
        this._careTeamCache.clear();
        this._familyCache.clear();
        this._trialGroupCache.clear();
      }
    });
  }

  public async loadUsers(type: 'HealthCareProfessional' | 'Patient') {
    if (type == 'HealthCareProfessional') {
      return await this._backendService.practitionerConnector.searchUsers(
        'HealthCareProfessional',
      );
    } else {
      return await this._backendService.patientConnector.searchUsers('Patient');
    }
  }

  public async disableUser(user: User): Promise<void> {
    // 1. If it arrives at this point after accepting from the confirmation popup
    try {
      // 2. it's called the practitioner removal backend service
      if (
        await this._backendService.practitionerConnector.disableUser(
          user.person,
        )
      ) {
        user.enabled = false;
        this.openSuccessSB('admin.user.disable.success');
      } else throw new Error();
    } catch (err) {
      // 3. In case of error it shows a toast
      this.openErrorSB('admin.user.disable.error');
    }
  }

  public async enableUser(user: User): Promise<void> {
    // 1. If it arrives at this point after accepting from the confirmation popup
    try {
      // 2. it's called the practitioner removal backend service
      if (
        await this._backendService.practitionerConnector.enableUser(user.person)
      ) {
        user.enabled = true;
        this.openSuccessSB('admin.user.enable.success'); // 'green'
      } else throw new Error();
    } catch (err) {
      // 3. In case of error it shows a toast
      this.openErrorSB('admin.user.enable.error'); // 'red''
    }
  }

  public async reloadAdministrativeData(
    patients: boolean = true,
    orgs: boolean = false,
    appointments: boolean = false,
  ): Promise<void> {
    if (!this.study) {
      this.study = (
        await this._backendService.trialConnector.getStudyRefByName(
          CodedValueConfig.studyName,
        )
      )?.at(0);
      if (!this.study) {
        throw new Error();
      }
    }
    if (orgs) {
      await this.loadOrgs();
    }
    if (patients) {
      await this.loadAndEnrichPatientData(true);
    }
    if (appointments) {
      await this._apptService.loadAppointments(true);
    }
  }

  public async registerUser(
    user: User,
    hcp?: HealthCareProfessional,
    family?: CareGiver[],
    enableCareTeam: boolean = false,
    additionalRoles: Role[] = [],
    sendMail: boolean = true,
    localeCode: Locale = LanguageConfig.DEFAULT_LOCALE,
    createDefaultPlan = true,
  ): Promise<Patient | undefined> {
    const errorMap: Map<REGISTRATION_ERRORS, boolean> = new Map<
      REGISTRATION_ERRORS,
      boolean
    >();
    const patient = user.person as Patient;
    let ts: TrialSubject | undefined;
    try {
      if (!patient.managingOrganization && hcp) {
        if (hcp?.personRoles?.length > 0) {
          patient.managingOrganization = hcp.personRoles[0].organization;
        }
      }
      // if no organization is assigned to the patient it assign the first organization of the current HCP (if any)
      if (patient.managingOrganization) {
        patient.personRoles = [
          new PersonRole(patient.managingOrganization, Role.PATIENT),
        ];

        additionalRoles.forEach((r) => {
          patient.personRoles.push(
            new PersonRole(patient.managingOrganization!, r),
          );
        });
      } else {
        errorMap.set('no.org', true);
        throw new Error('no.org');
      }
      if (!patient.domicile) {
        // add country to identify pilot
        patient.residence = new PersonAddress();
        patient.residence.country = environment.pilotCountry;
      }

      if (!user.locale) {
        user.locale = localeCode;
      }

      if (!user.password) {
        //gen random password no one will ever use
        user.password =
          PasswordGeneratorUtils.generatePasswordFromRegexAdvanced(
            this._validationPwd,
          );
      }
      // 1. call backend
      const res: Patient =
        (await this._backendService.patientConnector.registerUser(
          user,
        )) as Patient;

      if (res && res.id) {
        patient.id = res.id;
        const org = this._dataBus.allOrganizations.find(
          (o) => o.id == res.managingOrganization?.id,
        );
        res.managingOrganization = org;
      } else {
        errorMap.set('no.id', true);
        throw new Error('no.id');
      }

      try {
        ts = await this.createTrialSubject(res, additionalRoles);
      } catch (err) {
        errorMap.set('study-role.create', true);
      }
      try {
        await this.createCareTeam(res, enableCareTeam);
      } catch (err) {
        errorMap.set('care-team.create', true);
      }

      // Persist family members, if any and care team
      if (family && family.length > 0) {
        try {
          await this.createFamily(res, family);
        } catch (err) {
          errorMap.set('family-members.create', true);
        }
      }
      if (this.defaultPlan && createDefaultPlan) {
        try {
          await this.createDefaultPlan(res);
        } catch (err) {
          errorMap.set('default-plan.create', true);
        }
      }
      if (sendMail) {
        try {
          this.sendWelcomeEmail(res);
        } catch (err) {
          errorMap.set('welcome-email.create', true);
        }
      }
      if (errorMap.size > 0) {
        let msg = 'hcp.add-patient.add.warn.snack';
        if (errorMap.has('family-members.create')) {
          msg = 'hcp.add-patient-details.error.snack';
        }
        if (errorMap.has('welcome-email.create')) {
          msg = 'hcp.welcome-mail.error.snack';
        }
        this._snackbar.openSnackBar(msg, undefined, 4000, 'snack-error');
      } else {
        this._snackbar.openSnackBar(
          'hcp.add-patient.add.success.snack',
          undefined,
          4000,
          'snack-success',
        );
      }
      if (ts) this._dataBus.trialList = [...this._dataBus.trialList, ts];
      return res;
    } catch (err) {
      if (this.debug) {
        console.error(err);
      }
      this._snackbar.openSnackBar(
        'hcp.add-patient.add.error.snack',
        undefined,
        4000,
        'snack-error',
      );
      return undefined;
    }
  }
  private async createTrialSubject(
    res: Patient,
    additionalRoles: Role[],
  ): Promise<TrialSubject | undefined> {
    const group = CodedValueConfig.trialGroups.find((r) =>
      additionalRoles.some((rr) => r.code === rr.role),
    );
    if (group && this.study) {
      const ts = new TrialSubject();
      ts.group = group;
      ts.study = this.study;
      ts.patient = res;
      ts.id = (
        await this._backendService.trialConnector.createTrialSubject(ts)
      )?.id;
      return ts;
    }
    return undefined;
  }

  private async createCareTeam(
    p: Patient,
    enabled: boolean = false,
    o?: Organization,
  ) {
    let ct = new CareTeam();
    ct.patient = p;
    ct.organization = o ?? p.managingOrganization;
    ct.status = enabled ? CareTeamStatus.ACTIVE : CareTeamStatus.INACTIVE;
    ct = await this._backendService.careTeamConnector.create(ct);
    if (ct) this._careTeamCache.set(p.id!, ct);
  }

  private async createFamily(p: Patient, family: CareGiver[]) {
    family.forEach((m) => {
      m.patient = p;
    });
    family = await this._backendService.relatedPerson.createAll(family);
    if (family) this._familyCache.set(p.id!, family);
  }

  public async updateUser(patient: Patient): Promise<Patient> {
    try {
      await this._backendService.patientConnector.update(patient);
      const list = this._dataBus.trialList;
      const ts = list.find((ts) => ts.patient.fhirId == patient.fhirId);
      if (ts) {
        ts.patient = patient;
      }
      this._dataBus.trialList = list;
      return patient;
    } catch (error) {
      this._snackbar.openSnackBar(
        'hcp.add-patient.edit.error.snack',
        undefined,
        4000,
        'snack-error',
      );
      throw error;
    }
  }

  public async addFamily(
    p: Patient,
    family: CareGiver,
  ): Promise<CareGiver[] | undefined> {
    family.patient = p;

    family = await this._backendService.relatedPerson.create(family);
    if (family.id) this._familyCache.get(p.id!)?.push(family);
    return this._familyCache.get(p.id!);
  }
  private async createDefaultPlan(p: Patient) {
    if (this.defaultPlan) {
      let plan = new Plan();

      plan.patient = p;

      plan.start = new Date();
      plan.status = Plan.PlanStatus.ACTIVE;
      plan.due = addDays(new Date(), environment.planDuration ?? 30);
      plan.category = this.defaultPlan.focus;
      plan.goals = this.defaultPlan.goals.map((g) => {
        g.status = Goal.GoalStatus.ACTIVE;
        g.subject = p;
        return g;
      });
      plan = await this._backendService.carePlanConnector.create(plan);
    }
  }

  async deleteFamilyMember(
    patient: Patient,
    fm: CareGiver,
  ): Promise<CareGiver[] | undefined> {
    try {
      await this._backendService.relatedPerson.delete(fm);
      const family = (this._familyCache.get(patient.id!) ?? []).filter(
        (f) => f.id !== fm.id,
      );
      this._familyCache.set(patient.id!, family);
      return family;
    } catch (error) {
      console.log(error);
      this._snackbar.openSnackBar(
        'hcp.add-patient.edit.error.snack',
        undefined,
        4000,
        'snack-error',
      );
      return this._familyCache.get(patient.id!);
    }
  }

  private async getCareTeam(
    patient: Patient,
    forceReload: boolean = false,
  ): Promise<CareTeam | undefined> {
    let ct: CareTeam | undefined = undefined;
    if (!forceReload) {
      ct = this._careTeamCache.get(patient.id!);
    }
    if (!ct) {
      ct = (
        await this._backendService.careTeamConnector.searchByPatient(patient)
      )?.find((c: CareTeam) => c.isWholeOrganizationEnabled());
      if (ct) this._careTeamCache.set(patient.id!, ct);
    }
    return ct;
  }

  public async getTrialGroup(
    patient: Patient,
    forceReload: boolean = false,
  ): Promise<TrialSubject | undefined> {
    let ts: TrialSubject | undefined = undefined;
    if (!forceReload) {
      ts = this._trialGroupCache.get(patient.id!);
    }
    if (!ts) {
      ts = (
        await this._backendService.trialConnector.getTrialByPatient(
          patient,
          CodedValueConfig.studyName,
        )
      )?.find((c: TrialSubject) => c.patient.id == patient.id);
      if (ts) this._trialGroupCache.set(patient.id!, ts);
    }
    return ts;
  }

  public async enableCareTeam(p: Patient) {
    try {
      const ct = await this.getCareTeam(p);
      if (ct) {
        ct.status = CareTeamStatus.ACTIVE;
        this._backendService.careTeamConnector.update(ct);
        this._careTeamCache.set(p.id!, ct);
        this._snackbar.openSnackBar(
          'hcp.care-team.enable.success.snack',
          undefined,
          4000,
          'snack-success',
        );
      } else {
        await this.createCareTeam(p, true);
      }
    } catch (err) {
      if (this.debug) console.error(err);
      this._snackbar.openSnackBar(
        'hcp.care-team.enable.error.snack',
        undefined,
        4000,
        'snack-error',
      );
    }
  }

  public async disableCareTeam(p: Patient) {
    try {
      const ct = await this.getCareTeam(p);
      if (ct) {
        ct.status = CareTeamStatus.SUSPENDED;
        this._backendService.careTeamConnector.update(ct);
        this._careTeamCache.set(p.id!, ct);
        this._snackbar.openSnackBar(
          'hcp.care-team.disable.success.snack',
          undefined,
          4000,
          'snack-success',
        );
      }
    } catch (err) {
      if (this.debug) console.error(err);
      this._snackbar.openSnackBar(
        'hcp.care-team.enable.error.snack',
        undefined,
        4000,
        'snack-error',
      );
    }
  }

  public async updatePrescriptionStatus(
    sr: CounsellingPrescription,
    status: Plan.PlanStatus,
  ) {
    try {
      sr.status = status;
      const updatedSR =
        await this._backendService.serviceRequestConnector.updateCounselling(
          sr,
        );
      updatedSR.subject = sr.subject;
      this._dataBus.allCounsellingRequests =
        this._dataBus.allCounsellingRequests.filter(
          (o) => updatedSR.id !== o.id,
        );
      this._dataBus.allCounsellingRequests = [
        ...this._dataBus.allCounsellingRequests,
        updatedSR,
      ];
      this._snackbar.openSnackBar(
        'admin.service-request.update.success.snack',
        undefined,
        4000,
        'snack-success',
      );
    } catch (err) {
      if (this.debug) console.error(err);
      this._snackbar.openSnackBar(
        'admin.service-request.update.error.snack',
        undefined,
        4000,
        'snack-error',
      );
    }
  }
  public async isActiveCareTeam(p: Patient): Promise<boolean> {
    const ct = await this.getCareTeam(p);
    if (ct && ct.status == 'active') {
      return true;
    } else return false;
  }

  public async getFamily(p: Patient, forceReload = false) {
    let fm: CareGiver[] | undefined = undefined;
    if (!forceReload) {
      fm = this._familyCache.get(p.id!);
    }
    if (!fm) {
      fm = await this._backendService.relatedPerson.searcByPatient(p);
      this._familyCache.set(p.id!, fm);
    }
    return fm;
  }

  public isSelf(user: User): boolean {
    // TODO: find most appropriate field
    return user.id !== undefined && this._dataBus.currentUser?.id == user.id;
  }

  public async deletePatient(p: Patient) {
    if (!this._userService.checkRoles([Role.ADMIN])) return;
    if (!p.id) {
      throw new Error('User id is required');
    }
    try {
      await this.deleteById(p.id);
      this._dataBus.trialList = this._dataBus.trialList.filter(
        (pat) => p.id !== pat.patient.id,
      );
      this._snackbar.openSnackBar(
        'admin.user.delete.success',
        undefined,
        4000,
        'snack-success',
      );
    } catch (err) {
      this._snackbar.openSnackBar(
        'admin.user.delete.error',
        undefined,
        4000,
        'snack-error',
      );
    }
  }

  public async deletePractitioner(user: User) {
    if (!this._userService.checkRoles([Role.ADMIN])) return;
    if (this.isSelf(user)) {
      this._snackbar.openSnackBar(
        'admin.user.self.error',
        undefined,
        4000,
        'snack-error',
      );
    } else {
      const id = user.id ?? user.person?.id;
      if (id == undefined) {
        throw new Error('User id is required');
      }
      this.deleteById(id);
    }
  }

  private async deleteById(userID: number) {
    if (!this._userService.checkRoles([Role.ADMIN])) return;

    const x = await lastValueFrom(
      this._api.deletePractitioner(userID, 'response'),
    );
    if (!x.ok) throw new Error('Error: ' + x.status);
  }

  public async sendWelcomeEmail(user: Patient) {
    const id = user.id;
    if (!id) {
      throw new Error('User id is required');
    }
    const x = await lastValueFrom(this._api.sendWelcomeEmail(id, 'response'));
    if (!x.ok) throw new Error('Error: ' + x.status);
  }

  public async storeHCP(user: User): Promise<void> {
    if (this.debug) {
      console.log(JSON.stringify(user));
    }
    // 1. call backend
    const res =
      await this._backendService.practitionerConnector.registerUser(user);
    if (this.debug) {
      console.log(res);
    }
  }

  public async addOrganization(newOrganization: Organization) {
    try {
      const org =
        await this._backendService.organizationConnector.create(
          newOrganization,
        );
      this._dataBus.allOrganizations = [...this._dataBus.allOrganizations, org];
    } catch (error) {
      this._snackbar.openSnackBar(
        'admin.organization.add.error',
        undefined,
        4000,
        'snack-error',
      );
    }
  }

  public async editOrganization(newOrganization: Organization) {
    try {
      const org =
        await this._backendService.organizationConnector.update(
          newOrganization,
        );
      this._dataBus.allOrganizations = this._dataBus.allOrganizations.filter(
        (o) => org.id !== o.id,
      );
      this._dataBus.allOrganizations = [...this._dataBus.allOrganizations, org];
    } catch (error) {
      this._snackbar.openSnackBar(
        'admin.organization.add.error',
        undefined,
        4000,
        'snack-error',
      );
    }
  }

  private async loadAndEnrichPatientData(
    forceReload: boolean = false,
  ): Promise<void> {
    let patientList: Patient[] = [];
    const hcpOrgs = this._dataBus.hcpOrganizations;
    if (this._userService.checkRoles([Role.ADMIN])) {
      patientList =
        (await this._backendService.patientConnector.searchPatients(
          undefined,
          forceReload,
        )) ?? [];
    } else if (this._userService.checkRoles([Role.PRACTITIONER, Role.NURSE])) {
      for (const org of hcpOrgs) {
        const list =
          (await this._backendService.patientConnector.searchPatients(
            undefined,
            forceReload,
            undefined,
            {
              organization: org,
              practitioner: undefined,
            },
          )) ?? [];
        patientList.push(...list);
      }
    } else if (
      this._userService.checkRoles([Role.convertFromString('teacher')])
    ) {
      patientList = (
        (await this._backendService.patientConnector.searchPatients(
          undefined,
          forceReload,
          undefined,
        )) ?? []
      ).filter((p) => hcpOrgs.some((o) => o.id == p.managingOrganization?.id));
    } else {
      patientList = [];
    }
    const allOrgs = this._dataBus.allOrganizations;

    patientList.forEach((p) => {
      const org = allOrgs.find((o) => o.id == p.managingOrganization?.id);
      p.managingOrganization = org;
    });

    if (patientList.length > 0) {
      const trialGroups = (
        await this._backendService.trialConnector.getSubjectsByTrial(
          CodedValueConfig.studyName,
        )
      ).filter((tg) => patientList.some((p) => p.id == tg.patient?.id));

      trialGroups.forEach((tg) => {
        const p = patientList.find((p) => p.id == tg.patient?.id);
        if (p) tg.patient = p;
      });
      this._dataBus.trialList = trialGroups;
    }

    if (patientList.length > 0 && this._userService.checkRoles([Role.ADMIN])) {
      const serviceRequests: CounsellingPrescription[] =
        (await this._backendService.serviceRequestConnector.getAllCounselling(
          patientList,
        )) ?? [];
      serviceRequests.forEach((tg) => {
        const p = patientList.find((p) => p.id == tg.subject?.id);
        if (p) tg.subject = p;
      });
      this._dataBus.allCounsellingRequests = serviceRequests;
    }
    if (
      patientList.length > 0 &&
      this._userService.checkRoles([
        Role.ADMIN,
        Role.convertFromString('teacher'),
      ])
    ) {
      this._careTeamCache.clear();
      this._familyCache.clear();
      const families: CareGiver[] =
        (await this._backendService.relatedPerson.searcByPatients(
          patientList,
        )) ?? [];
      families.forEach((fm) => {
        if (fm.patient.id) {
          const pid = fm.patient.id;
          if (!this._familyCache.has(pid)) {
            this._familyCache.set(pid, []);
          }
          this._familyCache.get(pid)?.push(fm);
        }
      });

      const teams: CareTeam[] =
        (await this._backendService.careTeamConnector.searchByPatients(
          patientList,
        )) ?? [];
      teams.forEach((tm) => {
        if (tm.patient.id) {
          const pid = tm.patient.id;
          this._careTeamCache.set(pid, tm);
        }
      });
    }
  }

  private async loadOrgs(): Promise<void> {
    const os =
      (await this._backendService.organizationConnector.searchOrganizations()) ??
      [];
    this._dataBus.allOrganizations = os;
  }

  private openSuccessSB(msg: string) {
    this._snackbar.openSnackBar(msg, undefined, 4000, 'snack-success'); // 'green'
  }

  private openErrorSB(msg: string) {
    this._snackbar.openSnackBar(msg, undefined, 4000, 'snack-error');
  }
}
