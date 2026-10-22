import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import { DataStoreService, DataStoreKey } from './data-store.service';
import {
  User,
  Patient,
  Plan,
  Measure,
  HealthCareProfessional,
  Encounter,
  Organization,
  CareGiver,
  Risk,
  Appointment,
  TrialSubject,
  GenericQuantitativeMeasure,
  Nutrition,
  CounsellingPrescription,
} from '@eng-it4h/heart-ui-model';

@Injectable({
  providedIn: 'root',
})
export class DataBusService {
  // USERS
  private sectionTitleSubject: ReplaySubject<string | undefined> =
    new ReplaySubject<string | undefined>(1);
  private currentPatientSubject: BehaviorSubject<Patient | undefined> =
    new BehaviorSubject<Patient | undefined>(undefined);
  private userSubject: BehaviorSubject<User | undefined> = new BehaviorSubject<
    User | undefined
  >(undefined);

  // ADMINISTRATIVE DATA
  private allOrganizationsSubject: BehaviorSubject<Organization[]> =
    new BehaviorSubject<Organization[]>([]);

  private appointmentsSubject: BehaviorSubject<Appointment[]> =
    new BehaviorSubject<Appointment[]>([]);

  private trialGroupsSubject: BehaviorSubject<TrialSubject[]> =
    new BehaviorSubject<TrialSubject[]>([]);

  private allCounsellingRequestsSubject: BehaviorSubject<
    CounsellingPrescription[]
  > = new BehaviorSubject<CounsellingPrescription[]>([]);
  // PATIENT DATA
  private planSubject: BehaviorSubject<Plan | undefined> = new BehaviorSubject<
    Plan | undefined
  >(undefined);

  private currentEncounterSubject: BehaviorSubject<Encounter | undefined> =
    new BehaviorSubject<Encounter | undefined>(undefined);

  private encounterListSubject: BehaviorSubject<Encounter[]> =
    new BehaviorSubject<Encounter[]>([]);

  private familySubject: BehaviorSubject<CareGiver[]> = new BehaviorSubject<
    CareGiver[]
  >([]);

  private measuresSubject: BehaviorSubject<GenericQuantitativeMeasure[]> =
    new BehaviorSubject<GenericQuantitativeMeasure[]>([]);

  private nutritionSubject: BehaviorSubject<Nutrition[]> = new BehaviorSubject<
    Nutrition[]
  >([]);

  private risksSubject: BehaviorSubject<Risk[]> = new BehaviorSubject<Risk[]>(
    []
  );

  private initialRisksSubject: BehaviorSubject<Risk | undefined> =
    new BehaviorSubject<Risk | undefined>(undefined);

  private groupSubject: BehaviorSubject<TrialSubject | undefined> =
    new BehaviorSubject<TrialSubject | undefined>(undefined);

  private sessionPatientDataSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private administrativeDataSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  public constructor(private dataStore: DataStoreService) {
    // retrieves the instances in the local store to 'awake' the subjects
    this.initReplaySubjects();
  }

  /*********************
   * Section and Title
   *********************/
  public get sectionTitle$(): Observable<string | undefined> {
    return this.sectionTitleSubject.asObservable();
  }

  public setSectionTitleAndSection(title: string, section: string) {
    this.sectionTitle = title;
    this.dataStore.saveData(DataStoreKey.SECTION, section);
  }

  public set sectionTitle(title: string) {
    if (title) {
      title = title.trim();
      if (!title.startsWith('title.')) {
        title = 'title.' + title;
      }
      this.sectionTitleSubject.next(title);
    } else {
      this.sectionTitleSubject.next(undefined);
    }
  }

  public get patientDataReady$(): Observable<boolean> {
    return this.sessionPatientDataSubject.asObservable();
  }

  public get patientDataReady(): boolean {
    return this.sessionPatientDataSubject.value;
  }

  public set patientDataReady(b: boolean) {
    this.sessionPatientDataSubject.next(b);
  }

  public get administrativeDataReady$(): Observable<boolean> {
    return this.administrativeDataSubject.asObservable();
  }

  public get administrativeDataReady(): boolean {
    return this.administrativeDataSubject.value;
  }

  public set administrativeDataReady(b: boolean) {
    this.administrativeDataSubject.next(b);
  }

  /*********************
   * Logged-In User (i.e. Practitioner)
   *********************/
  public set currentUser(user: User | undefined) {
    if (user) {
      this.dataStore.saveData(DataStoreKey.LOGGED_USER, user);
    } else {
      this.dataStore.deleteObj(DataStoreKey.LOGGED_USER);
    }
    this.userSubject.next(user);
  }

  public get currentUser$(): Observable<User | undefined> {
    return this.userSubject.asObservable();
  }

  public get currentUser(): User | undefined {
    return this.userSubject.value;
  }

  public resetCurrentUser() {
    this.currentUser = undefined;
  }

  public get currentPractitioner(): HealthCareProfessional {
    return this.currentUser?.person as HealthCareProfessional;
  }

  /*********************
   * User Organization(s)
   *********************/

  public get hcpOrganizations(): Organization[] {
    const hcp = this.currentPractitioner;
    return this.allOrganizations.filter((o) =>
      hcp?.personRoles?.some((pr) => pr.organization?.id == o.id)
    );
  }

  public get allOrganizations(): Organization[] {
    return this.allOrganizationsSubject.value;
  }

  public set allOrganizations(orgs: Organization[]) {
    this.allOrganizationsSubject.next(orgs);
  }

  public get allOrganizations$(): Observable<Organization[]> {
    return this.allOrganizationsSubject.asObservable();
  }

  public get patientsList(): Patient[] {
    return this.trialGroupsSubject.value.map((tr) => tr.patient);
  }

  public get appointmmentList(): Appointment[] {
    return this.appointmentsSubject.value;
  }

  public set appointmmentList(value: Appointment[]) {
    this.appointmentsSubject.next(value);
  }

  public get appointmmentList$(): Observable<Appointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  public get trialList(): TrialSubject[] {
    return this.trialGroupsSubject.value;
  }

  public set trialList(value: TrialSubject[]) {
    this.trialGroupsSubject.next(value);
  }

  public get trialList$(): Observable<TrialSubject[]> {
    return this.trialGroupsSubject.asObservable();
  }

  public get allCounsellingRequests(): CounsellingPrescription[] {
    return this.allCounsellingRequestsSubject.value;
  }
  public set allCounsellingRequests(value: CounsellingPrescription[]) {
    this.allCounsellingRequestsSubject.next(value);
  }
  public get allCounsellingRequests$(): Observable<CounsellingPrescription[]> {
    return this.allCounsellingRequestsSubject.asObservable();
  }

  /*********************
   * Current Patient
   *********************/
  public set currentPatient(patient: Patient | undefined) {
    // if (patient) {
    //   this.dataStore.saveData(DataStoreKey.CURRENT_PATIENT, patient);
    // } else {
    //   this.dataStore.deleteObj(DataStoreKey.CURRENT_PATIENT);
    // }
    this.currentPatientSubject.next(patient);
  }

  public get currentPatient$(): Observable<Patient | undefined> {
    return this.currentPatientSubject.asObservable();
  }

  public get currentPatient(): Patient | undefined {
    return this.currentPatientSubject.value;
  }

  /*********************
   * Current Encounter
   *********************/
  public set currentEncounter(encounter: Encounter | undefined) {
    if (encounter) {
      // this.dataStore.saveData(DataStoreKey.CURRENT_ENCOUNTER, encounter);
      this.currentEncounterSubject.next(encounter);
    } else {
      // this.dataStore.deleteObj(DataStoreKey.CURRENT_ENCOUNTER);
      this.currentEncounterSubject.next(undefined);
    }
  }

  public get currentEncounter$(): Observable<Encounter | undefined> {
    return this.currentEncounterSubject.asObservable();
  }

  public get currentEncounter(): Encounter | undefined {
    return this.currentEncounterSubject.value;
  }

  /*********************
   * CURRENT PATIENT PLAN
   *********************/
  public set currentPlan(plan: Plan | undefined) {
    this.planSubject.next(plan);
  }

  public get currentPlan$(): Observable<Plan | undefined> {
    return this.planSubject.asObservable();
  }

  public get currentPlan(): Plan | undefined {
    return this.planSubject.value;
  }

  /*********************
   * CURRENT RISK
   *********************/

  public get currentRisks$(): Observable<Risk[]> {
    return this.risksSubject.asObservable();
  }

  public get currentRisks(): Risk[] {
    return this.risksSubject.value;
  }

  public set currentRisks(r: Risk[]) {
    this.risksSubject.next(r);
  }

  /*********************
   * INITIAL RISK
   *********************/

  public get initialRisk$(): Observable<Risk | undefined> {
    return this.initialRisksSubject.asObservable();
  }

  public get initialRisk(): Risk | undefined {
    return this.initialRisksSubject.value;
  }

  public set initialRisk(r: Risk | undefined) {
    this.initialRisksSubject.next(r);
  }

  /*********************
   * CURRENT Group
   *********************/

  public get currentGroup$(): Observable<TrialSubject | undefined> {
    return this.groupSubject.asObservable();
  }

  public get currentGroup(): TrialSubject | undefined {
    return this.groupSubject.value;
  }

  public set currentGroup(r: TrialSubject | undefined) {
    this.groupSubject.next(r);
  }

  /*********************
   * CURRENT RISK
   *********************/

  public get encounterList$(): Observable<Encounter[]> {
    return this.encounterListSubject.asObservable();
  }

  public get encounterList(): Encounter[] {
    return this.encounterListSubject.value;
  }

  public set encounterList(el: Encounter[]) {
    this.encounterListSubject.next(el);
  }

  /*********************
   * FAMILY MEMBERS
   *********************/

  public get family$(): Observable<CareGiver[]> {
    return this.familySubject.asObservable();
  }

  public get family(): CareGiver[] {
    return this.familySubject.value;
  }

  public set family(fl: CareGiver[]) {
    this.familySubject.next(fl);
  }

  /*********************
   * MEASURES
   *********************/

  public get measures$(): Observable<GenericQuantitativeMeasure[]> {
    return this.measuresSubject.asObservable();
  }

  public get measures(): GenericQuantitativeMeasure[] {
    return this.measuresSubject.value;
  }

  public set measures(fl: GenericQuantitativeMeasure[]) {
    this.measuresSubject.next(fl);
  }

  /*********************
   * NUTRITION
   *********************/

  public get nutrition$(): Observable<Nutrition[]> {
    return this.nutritionSubject.asObservable();
  }

  public get nutrition(): Nutrition[] {
    return this.nutritionSubject.value;
  }

  public set nutrition(fl: Nutrition[]) {
    this.nutritionSubject.next(fl);
  }

  /*********************
   * OTHER...
   *********************/
  public clear(): void {
    this.dataStore.flushMem();
    this.sectionTitle = 'title.application';
    this.currentPatient = undefined;
    this.currentUser = undefined;
  }

  private initReplaySubjects(): void {
    try {
      const user: User = this.dataStore.getData(
        DataStoreKey.LOGGED_USER
      ) as User;
      if (user) {
        this.userSubject.next(user);
      }
      const section: string = this.dataStore.getData(
        DataStoreKey.SECTION
      ) as string;
      if (section) {
        this.sectionTitleSubject.next(section);
      }
      // const patient: Patient = this.dataStore.getData(
      //   DataStoreKey.CURRENT_PATIENT
      // ) as Patient;
      // if (patient) {
      //   this.currentPatientSubject.next(patient);
      // }
    } catch (err) {
      console.log(err);
    }
  }
}
