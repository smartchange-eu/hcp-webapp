import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  NavigationExtras,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SERVER_OIDC } from '@config/server-configuration.conf';
import { User, Role } from '@eng-it4h/heart-ui-model';
import { environment } from '@env/environment';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { UserService } from '@modules/service/services/user.service';
import { Observable } from 'rxjs';

export type RedirectRoute = {
  roles: Role[];

  // see ActivatedRouteSnapshot#navigate parameters
  navigate: any[];
  extras?: NavigationExtras;
};

@Injectable()
export class RedirectHomeRouteGuard implements CanActivate {
  public constructor(
    private router: Router,
    private databus: DataBusService,
    private userService: UserService
  ) {
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
    const routes: RedirectRoute[] | undefined = route.data[
      'routes'
    ] as RedirectRoute[];

    return this.redirectUser(routes);
  }

  private redirectUser(
    routes?: RedirectRoute[]
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const user: User | undefined = this.databus.currentUser;

    if (
      user &&
      user.logged &&
      user.roles?.length > 0 &&
      routes &&
      routes?.length > 0
    ) {
      const route: RedirectRoute | undefined = routes.find((r) =>
        this.userService.checkRoles(r.roles)
      );

      if (route) {
        return this.router.createUrlTree(route.navigate);
      }
    } else if (!environment.enableAuthentication) {
      return this.router.createUrlTree(['./web/admin']);
    }

    return this.router.createUrlTree([SERVER_OIDC.unauthorizedRoute]);
  }
}
