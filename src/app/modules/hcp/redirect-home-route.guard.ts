import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
  createUrlTreeFromSnapshot,
} from '@angular/router';
import { Patient } from '@eng-it4h/heart-ui-model';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { Observable } from 'rxjs';

@Injectable()
export class RedirectHomeRouteGuard implements CanActivate {
  public constructor(private router: Router, private databus: DataBusService) {
    //
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.redirectUser(route);
  }

  private redirectUser(
    route: ActivatedRouteSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const patient: Patient | undefined = this.databus.currentPatient;

    if (
      (patient && patient?.patientIdentifier) ||
      patient?.uuid?.value ||
      patient?.id
    ) {
      return createUrlTreeFromSnapshot(route, ['./dashboard']);
    } else {
      return createUrlTreeFromSnapshot(route, ['./select']);
    }
  }
}
