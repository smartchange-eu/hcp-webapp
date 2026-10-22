import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SHOW_CONTROL_RISK } from '@config/server-configuration.conf';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';

import { DataBusService } from '@modules/service/services/data-bus.service';

@Injectable()
export class InterventionPatientSessionGuard implements CanActivate {
  public constructor(
    private router: Router,
    private dataBus: DataBusService,
    private backend: HeartUiConnectorService,
  ) {
    //
  }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    return await this.checkGroup(route, state);
  }

  private async checkGroup(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const subj = this.dataBus.currentGroup;
    if (subj && subj.group?.code !== 'control') {
      return true;
    } else if (
      SHOW_CONTROL_RISK &&
      state.url.startsWith('/web/hcp/dashboard/risk')
    ) {
      return true;
    } else {
      return this.router.parseUrl('/web/');
    }
  }
}
