import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Patient } from '@eng-it4h/heart-ui-model';

import { DataBusService } from '@modules/service/services/data-bus.service';

@Injectable()
export class PatientSessionGuard implements CanActivate {
  public constructor(private router: Router, private databus: DataBusService) {
    //
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.redirectUser();
  }

  private redirectUser(): boolean {
    const patient: Patient | undefined = this.databus.currentPatient;
    // FIXME: in caso di logica più fine modificare questo comportamento
    if (patient?.patientIdentifier || patient?.uuid?.value || patient?.id) {
      return true;
    } else {
      this.router.navigate(['./web/hcp/select'], { replaceUrl: true });
      return false;
    }
  }
}
