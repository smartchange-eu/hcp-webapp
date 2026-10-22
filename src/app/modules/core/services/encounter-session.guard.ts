import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  User,
  Role,
  Patient,
  Episode,
  Encounter,
} from '@eng-it4h/heart-ui-model';
import { EncounterService } from '@modules/encounter/encounter.service';
import { DataBusService } from '@modules/service/services/data-bus.service';

@Injectable()
export class EncounterSessionGuard implements CanActivate {
  public constructor(
    private router: Router,
    private databus: DataBusService,
    private encounterService: EncounterService
  ) {
    //
  }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return await this.redirectUser(route);
  }

  private async redirectUser(route: ActivatedRouteSnapshot): Promise<boolean> {
    const encounter: Encounter | undefined = this.databus.currentEncounter;
    //in caso di logica più fine modificare questo comportamento
    if (route.queryParams['suggestion'] != undefined) {
      // se il redirect proviene da un'accettazione di un suggerimento
      const pat = this.databus.currentPatient;
      if (!pat) {
        console.log('Patient not in session'); // NEVER
        return false;
      }
      return this.encounterService
        .sendActiveEncounterIfExists(pat!, true)
        .then((epExists) => {
          if (!epExists) {
            console.error(
              `No existing open encounters for this patient ${pat?.id} `
            );
          }
          return epExists;
        });
    } else {
      if (encounter?.type) {
        return true;
      } else {
        this.router.navigate(['./web/hcp/dashboard/encounters'], {
          replaceUrl: true,
        });
        return false;
      }
    }
  }
}
