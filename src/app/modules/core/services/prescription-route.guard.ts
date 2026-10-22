import { compareAsc } from 'date-fns';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  createUrlTreeFromSnapshot,
  Route,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import { Plan } from '@eng-it4h/heart-ui-model';
import { CodedValueConfig } from '@config/service/coded-values.config';

@Injectable()
export class PrescriptionRouteGuard implements CanActivate {
  public constructor(
    private dataBus: DataBusService,
    private backend: HeartUiConnectorService,
    private router: Router
  ) {
    //
  }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    return await this.checkUser(route, state);
  }

  private async checkUser(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    let plan = this.dataBus.currentPlan;
    const patient = this.dataBus.currentPatient!;
    if (!plan) {
      const plans = await this.backend.carePlanConnector.searchByPatient(
        patient,
        Plan.PlanStatus.ACTIVE
      );
      if (plans?.length > 0) {
        // sorts the plans by ascending order and retrive the one with biggest start date
        const newPlan = plans
          .sort((p1, p2) => compareAsc(p1.start, p2.start))
          .pop();

        plan = newPlan;
        this.dataBus.currentPlan = plan;
      }
    }
    if (plan && !this.isDafault(plan)) {
      // vai alla pagina di edit
      return createUrlTreeFromSnapshot(route, ['./edit']);
    } else {
      // vai alla plan definition
      return createUrlTreeFromSnapshot(route, ['./new']);
    }
  }

  isDafault(plan: Plan) {
    return plan.category?.code === CodedValueConfig.defaultPlanFocus.code;
  }
}
