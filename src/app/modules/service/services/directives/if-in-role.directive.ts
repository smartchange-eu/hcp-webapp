// tslint:disable:directive-selector
import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

import { Role } from '@eng-it4h/heart-ui-model';

import { UserService } from '../user.service';
import { environment } from '@env/environment';

@Directive({
  selector: '[ifInRole]'
})
export class IfInRoleDirective implements OnInit {
  @Input('ifInRole') public role?: (Role | string) | (Role | string)[];

  public constructor(
    private viewContainer: ViewContainerRef,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private templateRef: TemplateRef<any>,
    private userService: UserService,
  ) { }

  public ngOnInit(): void {
    if ( !environment.enableAuthentication ) {
      this.viewContainer.createEmbeddedView(this.templateRef);

      return;
    }

    const roles: Role[] = this.rolesToArray();

    const hasAnyRole = this.userService.checkRoles(roles);

    if (hasAnyRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private rolesToArray(): Role[] {
    const converter = (r: Role | string): Role => {
      if (typeof r == "string") {
        return Role.convertFromString(r as string);
      } else {
        return r as Role;
      }
    };

    let roles: Role[] = [];

    if (this.role) {
      if (!Array.isArray(this.role)) {
        roles = [converter(this.role)];
      } else {
        roles = (this.role as (Role | string)[]).map(converter);
      }
    }

    return roles;
  }
}
