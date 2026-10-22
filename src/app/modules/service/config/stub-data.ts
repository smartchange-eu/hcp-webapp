import { Injectable } from '@angular/core';

import { ServerError } from '@eng-it4h/heart-ui-connector';
import {
  Appointment,
  ConditionClinicalStatus,
  Encounter,
  GenericQuantitativeMeasure,
  MolecularConsequence,
  Study,
  Vcf,
  VcfMetadata,
} from '@eng-it4h/heart-ui-model';
import { ConditionVerificationStatus } from '@eng-it4h/heart-ui-model';
import { DiagnosisType } from '@eng-it4h/heart-ui-model';
import { Diagnosis } from '@eng-it4h/heart-ui-model';
import {
  BMI,
  ChromosomePosition,
  CodedValue,
  Condition,
  Episode,
  Gender,
  GenomicVariant,
  Patient,
  Quality,
  User,
  Weight,
  HealthCareProfessional,
  Organization,
  PersonRole,
  Role,
  Questionnaire,
  HealthService,
} from '@eng-it4h/heart-ui-model';
import { uniqueId } from 'lodash-es';

export const stubError: ServerError = {
  severity: 'GRAVE',
  code: '500',
  diagnostics: 'stub server error',
};

@Injectable()
export class StubData {
  public static idCount = 0;
  public static users: User[] = [];

  public static weights: Weight[] = [];

  public static bmis: BMI[] = [];
  public static orgs: Organization[] = [];
  public static genomicVariants: GenomicVariant[] = [];

  public static questionnaires: Questionnaire[] = [];
  public static conditions: Condition[] = [];

  public static episodes: Episode[] = [];
  public static appts: Appointment[] = [];

  public static encounters: Encounter[] = [];

  private static MAX_ORGS = 2;

  public static genericQuantitativeMeasures: GenericQuantitativeMeasure[] = [];

  public static vcfMetadata: Study[] = [];

  public static vcfs: Vcf[] = [];

  static {
    StubData.orgs = StubData.readOrgs(StubData.MAX_ORGS);
    StubData.users.push(
      ...StubData.readPatients(10).map((p) => StubData.createUser(p))
    );
    StubData.users.push(
      ...StubData.readPractitioners(5).map((p) => StubData.createUser(p))
    );
    StubData.users.push(
      ...StubData.readResearchers(5).map((p) => StubData.createUser(p))
    );
    StubData.bmis = StubData.readBmis();
    StubData.weights = StubData.readWeights();
    StubData.episodes = StubData.readEpisodes();
    StubData.genomicVariants = StubData.readGenomicVariantsRWD();
    StubData.conditions = StubData.readConditions();
    StubData.genericQuantitativeMeasures =
      StubData.readGenericQuantitativeMeasures();
    StubData.vcfMetadata = StubData.readGenomicStudiesAnalysis();
    StubData.vcfs = StubData.readVcfs();
  }

  private static createUser(p: Patient | HealthCareProfessional): User {
    return new User({
      id: p.id,
      username: p.name,
      person: p,
      enabled: true,
    });
  }

  private static readPatients(tot: number): Patient[] {
    const heartPatients: Patient[] = [];

    for (let i = 0; i < tot; i++) {
      const p = new Patient(StubData.idCount++);
      p.firstName = `Name_${i}`;
      p.lastName = `Surname_${i}`;
      p.age = 6 + this.getRandomInt(10);
      p.personRoles = [
        new PersonRole(
          StubData.orgs[this.getRandomInt(StubData.MAX_ORGS)],
          Role.PATIENT
        ),
      ];
      p.gender = this.getRandomInt(2) == 0 ? Gender.male : Gender.female;
      heartPatients.push(p);
    }

    return heartPatients;
  }

  private static readPractitioners(tot: number): HealthCareProfessional[] {
    const heartPatients: HealthCareProfessional[] = [];

    for (let i = 0; i < tot; i++) {
      const p = new HealthCareProfessional(StubData.idCount++);
      p.name = `Name_hcp_${i}`;
      p.family = `Surname_hcp_${i}`;
      p.age = 40 + this.getRandomInt(10);
      p.gender = this.getRandomInt(2) == 0 ? Gender.male : Gender.female;
      p.personRoles = [
        new PersonRole(
          StubData.orgs[this.getRandomInt(StubData.MAX_ORGS - 1)],
          Role.PRACTITIONER
        ),
        new PersonRole(
          StubData.orgs[this.getRandomInt(StubData.MAX_ORGS - 1)],
          Role.RESEARCHER
        ),
      ];
      heartPatients.push(p);
    }

    return heartPatients;
  }

  private static readResearchers(tot: number): HealthCareProfessional[] {
    const heartPatients: HealthCareProfessional[] = [];

    for (let i = 0; i < tot; i++) {
      const p = new HealthCareProfessional(StubData.idCount++);
      p.name = `Name_rs_${i}`;
      p.family = `Surname_rs_${i}`;
      p.age = 40 + this.getRandomInt(10);
      p.gender = this.getRandomInt(2) == 0 ? Gender.male : Gender.female;
      p.personRoles = [
        new PersonRole(
          StubData.orgs[this.getRandomInt(StubData.MAX_ORGS - 1)],
          Role.RESEARCHER
        ),
      ];
      heartPatients.push(p);
    }

    return heartPatients;
  }

  private static readOrgs(tot: number): Organization[] {
    const orgs: Organization[] = [];

    for (let i = 0; i < tot; i++) {
      const p = new Organization(StubData.idCount++);
      p.name = `OrgName_${i}`;
      orgs.push(p);
    }
    return orgs;
  }

  private static readBmis(): BMI[] {
    const toRet: BMI[] = [];
    const tot = 30;
    for (let i = 0; i < tot; i++) {
      const bmi = new BMI();
      bmi.value = 12 + this.getRandomInt(30);
      const m = this.getRandomInt(9) + 1;
      bmi.assertedWhen = new Date(2022, m, this.getRandomInt(27) + 1);
      bmi.notes = (
        new Date().getUTCMilliseconds() * this.getRandomInt(100)
      ).toString();
      toRet.push(bmi);
    }
    return toRet;
  }

  private static readWeights(): Weight[] {
    const toRet: Weight[] = [];
    const tot = 30;
    for (let i = 0; i < tot; i++) {
      const ws = new Weight();
      ws.value = 70 + this.getRandomInt(15);
      const m = this.getRandomInt(9) + 1;
      ws.assertedWhen = new Date(2022, m, this.getRandomInt(27) + 1);
      ws.notes = (
        new Date().getUTCMilliseconds() * this.getRandomInt(100)
      ).toString();
      toRet.push(ws);
    }
    return toRet;
  }

  private static readEpisodes(): Episode[] {
    const toRet: Episode[] = [];

    const o = new Organization(1, 'Org_1');
    const ep0 = new Episode();
    // ep0.careManager = this.hcp!;
    ep0.openingDate = new Date(2019, 9, 22);
    ep0.closingDate = new Date(2019, 9, 22);
    ep0.type = HealthService.DAY_HOSPITAL;
    ep0.managingOrganization = o;

    const ep1 = new Episode();
    // ep1.careManager = this.hcp!;
    ep1.openingDate = new Date(2019, 10, 23);
    ep1.closingDate = new Date(2019, 11, 14);
    ep1.type = HealthService.HOSPITALIZATION;
    ep1.managingOrganization = o;

    const ep2 = new Episode();
    // ep2.careManager = this.hcp!;
    ep2.openingDate = new Date(2020, 0, 15);
    ep2.closingDate = new Date(2020, 0, 15);
    ep2.type = HealthService.OUTPATIENT;
    ep2.managingOrganization = o;

    const ep3 = new Episode();
    // ep3.careManager = this.hcp!;
    ep3.openingDate = new Date(2021, 8, 8);
    ep3.closingDate = new Date(2021, 8, 8);
    ep3.type = HealthService.DAY_HOSPITAL;
    ep3.managingOrganization = o;

    const ep4 = new Episode();
    // ep4.careManager = this.hcp!;
    ep4.openingDate = new Date(2023, 9, 5);
    ep4.type = HealthService.DAY_HOSPITAL;
    ep4.managingOrganization = o;

    toRet.push(ep0);
    toRet.push(ep1);
    toRet.push(ep2);
    toRet.push(ep3);
    toRet.push(ep4);

    return toRet;
  }

  private static readConditions(): Condition[] {
    const toRet: Condition[] = [];

    const d1 = new Diagnosis();
    d1.code = new CodedValue('x', 'x', 'x');
    d1.id = +uniqueId();
    d1.types = [DiagnosisType.CLINICAL, DiagnosisType.GENETIC];
    d1.verificationStatus = ConditionVerificationStatus.CONFIRMED;
    d1.clinicalStatus = ConditionClinicalStatus.RESOLVED;

    const d2 = new Diagnosis();
    d2.code = new CodedValue('y', 'y', 'y');
    d2.id = +uniqueId();
    d2.verificationStatus = ConditionVerificationStatus.PROVISIONAL;
    d2.clinicalStatus = ConditionClinicalStatus.ACTIVE;

    toRet.push(d1);
    toRet.push(d2);

    return toRet;
  }

  private static readGenomicVariantsRWD(): GenomicVariant[] {
    const toRet: GenomicVariant[] = [];
    const source: CodedValue = new CodedValue(
      'loinc',
      'somatic-code',
      'somatic-display'
    );
    let element = new GenomicVariant(199969, source);
    element.geneName = new CodedValue(
      'http://www.genenames.org/geneId',
      'TP53',
      'TP53'
    );
    element.chromo = new CodedValue(
      'https://loinc.org/LL2938-0/',
      'LA21270-6',
      'Chromosome 17'
    );
    // element.codingChange = new CodedValue('http://varnomen.hgvs.org', 'c.469C>T', 'c.469C>T');
    // element.proteinChange = new CodedValue('http://varnomen.hgvs.org', 'p.Arg157*', 'p.Arg157*');
    // element.transcript = new CodedValue('loinc', 'transcript_code_'+i, 'Transcript_'+i);
    // new CodedValue('http://www.sequenceontology.org/', 'nonsense_variant', 'nonsense_variant');
    const molCons = new MolecularConsequence(199969);
    molCons.codingChange = new CodedValue(
      'http://varnomen.hgvs.org',
      'c.469C>T',
      'c.469C>T'
    );
    molCons.proteinChange = new CodedValue(
      'http://varnomen.hgvs.org',
      'p.Arg157*',
      'p.Arg157*'
    );
    molCons.transcriptRefSeq = new CodedValue(
      'loinc',
      'transcript_code_',
      'Transcript_'
    );
    molCons.featureConsequences = [
      new CodedValue('loinc', 'feat_1', 'Feat_1'),
      new CodedValue('loinc', 'feat_2', 'Feat_2'),
    ];
    element.molecularConsequences = [molCons];

    element.type = new CodedValue(
      'http://www.sequenceontology.org/',
      'SNV',
      'SNV'
    );

    const position = new ChromosomePosition();
    position.start = [7674945];
    // position.end = [];
    // position.exon = i%2 == 0 ? "Exon_"+i : undefined
    element.position = position;

    element.reference = 'C';
    element.alteration = 'T';

    const coverage = 33;
    const frequency = 0.757576;
    const qual = new Quality(coverage, frequency);
    element.quality = qual;

    toRet.push(element);

    return toRet;
  }

  static readGenomicStudiesAnalysis(): Study[] {
    const toRet: Study[] = [];
    const tot = 5;
    for (let index = 0; index < tot; index++) {
      const s = new Study();
      s.vcfsMeta = [];
      const startDate = new Date(2022, 0, 1);
      const endDate = new Date();
      const metas = this.getRandomInt(3);
      for (let index = 0; index < metas; index++) {
        const vcfMetadata = new VcfMetadata();
        vcfMetadata.date = this.getRandomDate(startDate, endDate);
        // vcfMetadata.id = this.getRandomInt(1000);
        vcfMetadata.sequencing = new CodedValue(
          'system_seq',
          'code_' + this.getRandomInt(1)
        );
        vcfMetadata.specimen = new CodedValue(
          'system_specimen',
          'code_' + this.getRandomInt(5)
        );
        s.vcfsMeta.push(vcfMetadata);
      }
      toRet.push(s);
    }

    return toRet;
  }

  static readVcfs(): Vcf[] {
    const bases: string[] = ['A', 'C', 'G', 'T'];
    const toRet: Vcf[] = [];
    const vcf = new Vcf();
    vcf.variants = [];
    const tot = 33;
    for (let index = 0; index < tot; index++) {
      const item: GenomicVariant = new GenomicVariant(
        this.getRandomInt(1000),
        new CodedValue('system_', 'code_' + this.getRandomInt(1))
      );
      const chr = 1 + this.getRandomInt(22);
      item.chromo = new CodedValue(
        'chr_system',
        'chr_' + chr,
        ('0' + chr).slice(-2)
      );
      item.position = new ChromosomePosition();
      item.position.start = [this.getRandomInt(100000)];
      const r = this.getRandomInt(450);
      const q = this.getRandomInt(r);
      item.quality = new Quality(q, r);
      const refIndex = this.getRandomInt(4);
      const ref = bases[refIndex];
      const alt = bases[(refIndex + 2) % 4];
      item.reference = ref;
      item.alteration = alt;

      item.geneName = new CodedValue('system', 'G_name_' + index);

      const molCons = new MolecularConsequence(199969);
      molCons.codingChange = new CodedValue(
        'http://varnomen.hgvs.org',
        'c.469C>T',
        'c.469C>T'
      );
      molCons.proteinChange = new CodedValue(
        'http://varnomen.hgvs.org',
        'p.Arg157*',
        'p.Arg157*'
      );
      molCons.transcriptRefSeq = new CodedValue(
        'loinc',
        'transcript_code_',
        'Transcript_'
      );
      molCons.featureConsequences = [
        new CodedValue('loinc', 'feat_1', 'Feat_1'),
        new CodedValue('loinc', 'feat_2', 'Feat_2'),
      ];
      item.molecularConsequences = [molCons];

      vcf.variants.push(item);
    }
    toRet.push(vcf);
    return toRet;
  }

  static readGenericQuantitativeMeasures(): GenericQuantitativeMeasure[] {
    const toRet: GenericQuantitativeMeasure[] = [];

    return toRet;
  }

  private static getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  private static getRandomDate(start: Date, end: Date) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }
}
