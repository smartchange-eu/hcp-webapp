import { Gender, LifeStyle } from '@eng-it4h/heart-ui-model';

export class PatientProfile {
  public readonly bmr: number;
  public readonly bmi: number;
  public readonly optimalWaist: number;

  // riduzione calorica per fascia di BMI
  private static REDUCTION_1 = 380; // 20-27
  private static REDUCTION_2 = 500; // 27-30
  private static REDUCTION_3 = 620; // 30+
  private static MALE_GUARD = 1400;
  private static FEMALE_GUARD = 1300;

  //	private static THR_1 = 25;
  //	private static THR_2 = 27;
  //	private static THR_3 = 30;

  public constructor(
    public readonly weightInKg: number,
    public readonly laf: LifeStyle.LifeStyleCategory,
    public readonly heightInCm: number,
    public readonly age: number,
    public readonly gender: Gender
  ) {
    this.bmr = this.calculateBMR(gender, weightInKg, heightInCm, age);

    this.bmi = this.calculateBMI();

    /**
     * Soglie:
     * uomini: >94 cm RISK INCREASED, >102 cm RISK GREATLY INCREASED
     * donne: >80 cm RISK INCREASED, >88 cm RISK GREATLY INCREASED
     */
    this.optimalWaist = Gender.male === gender ? 94 : 80;
  }

  public getWeightWithReductionOf(reductionPercentage: number): number {
    return Math.round(this.weightInKg - this.weightInKg * reductionPercentage);
  }

  public getDailyCalories(applyFatLoss: boolean): number {
    return this.calculateCaloricIntake(
      this.toLAF(this.laf),
      this.bmr,
      applyFatLoss
    );
  }

  private toLAF(lifestyle: LifeStyle.LifeStyleCategory): number {
    switch (lifestyle) {
      case LifeStyle.LifeStyleCategory.SEDENTARY.toString(): {
        return 1.2;
      }
      case LifeStyle.LifeStyleCategory.POORLY_ACTIVE.toString(): {
        return 1.3;
      }
      default:
      case LifeStyle.LifeStyleCategory.ACTIVE.toString(): {
        return 1.4;
      }
      case LifeStyle.LifeStyleCategory.VERY_ACTIVE.toString(): {
        return 1.5;
      }
      case LifeStyle.LifeStyleCategory.ATHLETIC.toString(): {
        return 1.6;
      }
    }
  }

  private calculateBMR(
    gender: Gender,
    weightInKg: number,
    heightInCm: number,
    age: number
  ): number {
    let bmr: number = 0.0;

    // The original Harris–Benedict (1919)
    if (Gender.male === gender) {
      bmr = 66.473 + 13.752 * weightInKg + 5.003 * heightInCm - 6.755 * age;
    } else {
      bmr = 655.096 + 9.563 * weightInKg + 1.85 * heightInCm - 4.676 * age;
    }

    // The Harris–Benedict equations revised by Roza and Shizgal in 1984.
    // The 95% confidence range for men is ±213.0 kcal/day, and ±201.0 kcal/day for women.
    //		if ( Gender.male === gender ) {
    //			bmr = (88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age));
    //		} else {
    //			bmr = (447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age));
    //		}

    // Mifflin St Jeor
    //		if ( Gender.male === gender ) {
    //			bmr = (5 + (10.0 * weightInKg) + (6.25 * heightInCm) - (5 * age));
    //		} else {
    //			bmr = (-161 + (10.0 * weightInKg) + (6.25 * heightInCm) - (5 * age));
    //		}

    return bmr;
  }

  private calculateBMI(): number {
    let bmi: number;
    bmi = this.weightInKg / Math.pow(this.heightInCm / 100, 2);
    return bmi;
  }

  /**
   * Calcola l'intake calorico per il paziente sulla base si stile di vita e BMR
   *
   * @param laf
   * 1.2: If you are sedentary (little or no exercise)
   * 1.375: If you are lightly active (light exercise/sports 1-3 days/week)
   * 1.55: If you are moderately active (moderate exercise/sports 3-5 days/week)
   * 1.725: If you are very active (hard exercise/sports 6-7 days a week)
   * 1.9: If you are extra active (very hard exercise/sports & physical job or 2x training)
   * @param bmr
   * @param applyFatLoss
   * @return
   */
  private calculateCaloricIntake(
    laf: number,
    bmr: number,
    applyFatLoss: boolean
  ): number {
    const rkCal: number = Math.round(bmr * laf);
    let kCal: number;

    //se 'applyFatLoss' è true ridurre le calorie assegnate
    if (!applyFatLoss) {
      // console.log(`DEBUG Kcal daily intake WITHOUT FAT LOSS: ${rkCal}`);

      kCal = rkCal; // valutare se kcal è comunque troppo alto questo intake calorico
    } else {
      // applica la riduzione calorica
      let dkCal: number = 0;
      if (this.bmi < 27) {
        dkCal = rkCal - PatientProfile.REDUCTION_1;
      } else if (this.bmi >= 27 && this.bmi < 30) {
        dkCal = rkCal - PatientProfile.REDUCTION_2;
      } else if (this.bmi > 30) {
        dkCal = rkCal - PatientProfile.REDUCTION_3;
      }

      // arrotonda alle centinaia
      if (dkCal > 0) {
        // rounds the caloric intake value to the hundreds
        dkCal -= dkCal % 100;
      }

      // verifica la guardia [Caruso]
      if (Gender.male === this.gender) {
        if (dkCal < PatientProfile.MALE_GUARD) {
          dkCal = PatientProfile.MALE_GUARD;
        }
      } else {
        if (dkCal < PatientProfile.FEMALE_GUARD) {
          dkCal = PatientProfile.FEMALE_GUARD;
        }
      }

      // console.log(`DEBUG Kcal daily intake WITH FAT LOSS: ${dkCal}`);
      kCal = dkCal;
    }

    return +kCal.toPrecision(2);
  }
}
