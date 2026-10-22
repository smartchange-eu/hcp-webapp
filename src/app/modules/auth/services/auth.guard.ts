import { forwardRef, Inject, Injectable } from '@angular/core';
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
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { AbstractAuthService } from './abstract-auth-service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanLoad {
  deblog = environment.debug;
  auth = environment.enableAuthentication;
  public constructor(
    public router: Router,
    private _auth: AbstractAuthService
  ) {
    // console.log('[AuthGuard] Constructor');
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.isLoggedIn();
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.isLoggedIn();
  }

  private isLoggedIn():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (this.auth) {
      // ok
      const logged = this._auth.isLogged();
      if (logged) {
        if (this.deblog) {
          console.log(`canActivate -> GRANTED`);
        }
        return true;
      } else {
        if (this.deblog) {
          console.log(`canActivate -> ISSUE`);
        }
        // redirect to the 'unauthorized' page as the user is not logged-in
        return this.router.createUrlTree(['/web/auth']);
      }
    } else {
      if (this.deblog) {
        console.log(`[Auth Guard] canActivate -> GUI`);
      }
      return true;
    }
  }
}
