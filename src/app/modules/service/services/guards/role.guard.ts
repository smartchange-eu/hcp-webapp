import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserService } from '../user.service';
import { Role } from '@eng-it4h/heart-ui-model';
import { SERVER_OIDC } from '@config/server-configuration.conf';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate, CanLoad {
  deblog = environment.debug;
  auth = environment.enableAuthentication;
  public constructor(public router: Router, private _us: UserService) {}

  public canLoad(
    route: Route,
    segments: UrlSegment[]):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
      const roles: Role[] = route.data ? route.data['roles'] : [];

      if (this.auth) {
        return this.checkUser(roles);
      } else {
        return true;
      }
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const roles: Role[] = route.data ? route.data['roles'] : [];

    if (this.auth) {
      return this.checkUser(roles);
    } else {
      return true;
    }
  }

  private checkUser(
    roles: Role[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    // ok
    if (this._us.checkRoles(roles)) {
      if (this.deblog) {
        console.debug(`[RoleGuard] canActivate -> GRANTED`);
      }
      return true;
    } else {
      if (this.deblog) {
        console.debug(`[RoleGuard] canActivate -> ISSUE`);
      }
      // redirect to the 'forbidden' page as the user has not the right role to access the page
      return this.router.createUrlTree([SERVER_OIDC.forbiddenRoute]);
    }
  }
}
