import { Injectable } from '@angular/core';
import { Patient, Role } from '@eng-it4h/heart-ui-model';
import { DataBusService } from '@modules/service/services/data-bus.service';
import { environment } from '@env/environment';
import { UserService } from '@modules/service/services/user.service';

export interface Menu {
  order: number;
  state?: string;
  name?: string;
  type: 'link' | 'internal' | 'separator' | 'subheader' | 'internal-link';

  /**
   * Menu item icon
   */
  icon?: string;

  /**
   * Express a boolean condition to show/hide the menu item
   * @param params
   * @returns
   */
  conditions?: ((condition: MenuCondition) => boolean)[];

  /**
   * Notification badges
   */
  badge?: Badge;
}

export interface Badge {
  value: number;
  type?: string;
}

interface MenuCondition {}

interface MenuPatientCondition extends MenuCondition {
  patient?: Patient;
}

interface MenuUserRoleCondition extends MenuCondition {
  roles?: Role[];
  userService?: UserService;
}

function checkUserRole(
  roles: Role[],
): (params: MenuUserRoleCondition) => boolean {
  return (params: MenuUserRoleCondition) => {
    if (params && params.userService) {
      if (!environment.enableAuthentication) {
        return true;
      }

      if (params.userService && roles.length > 0) {
        if (!params.userService.checkRoles(roles!)) {
          return false;
        }
      }
    }

    return true;
  };
}

function checkSlofit(): (params: MenuUserRoleCondition) => boolean {
  return (params: MenuUserRoleCondition) => {
    if (environment.slofitPidSystem.length > 0) {
      return true;
    }

    return false;
  };
}

function checkPatientSelected(params: MenuPatientCondition): boolean {
  // is there a param of type 'Patient'?
  // this is a Patient deserialization issue. is should never be a JSON object (FIX in 'updated_patient_list' branch)
  const patient = params?.patient;

  if (!patient) {
    return true;
  }

  if (
    patient instanceof Patient ||
    (patient as any)?.resourceType == 'Patient'
  ) {
    return true;
  }

  return false;
}

// order from 0
const HCP_MENUITEMS: Menu[] = [
  {
    order: 0,
    state: '/web/hcp/dashboard',
    name: 'title.home',
    type: 'link',
    icon: 'home',
    conditions: [checkUserRole([Role.PRACTITIONER, Role.NURSE])],
  },
  // {
  //   order: 0,
  //   state: '/web/hcp/appointments',
  //   name: 'title.appointments',
  //   type: 'link',
  //   icon: 'event',
  //   conditions: [checkUserRole([Role.PRACTITIONER, Role.NURSE])],
  // },
];

// order from 50
const ADMIN_MENUITEMS: Menu[] = [
  {
    order: 50,
    state: '/web/admin/hcp-registry',
    name: 'title.hcp_registry',
    type: 'link',
    icon: 'groups_2',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 54,
    type: 'separator',
  },
  {
    order: 55,
    state: '/web/admin/add-hcp',
    name: 'title.add_hcp',
    type: 'link',
    icon: 'person_add_alt',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 52,
    state: '/web/admin/manage-users',
    name: 'title.patients_registry',
    type: 'link',
    icon: 'family_restroom',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 56,
    state: '/web/admin/add-user',
    name: 'title.add_user',
    type: 'link',
    icon: 'person_add',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 51,
    state: '/web/admin/manage-organizations',
    name: 'title.manage_orgs',
    type: 'link',
    icon: 'business',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 52,
    state: '/web/admin/manage-appointments',
    name: 'title.manage_appointments',
    type: 'link',
    icon: 'event',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 57,
    state: '/web/admin/add-admin',
    name: 'admin.add.admin.title',
    type: 'link',
    icon: 'person_add_alt',
    conditions: [checkUserRole([Role.ADMIN])],
  },
  {
    order: 53,
    state: '/web/admin/manage-slofit',
    name: 'Slofit',
    type: 'link',
    conditions: [checkSlofit(), checkUserRole([Role.ADMIN])],
  },
  // {
  //   order: 52,
  //   state: '/web/admin/fixtures',
  //   name: 'title.fixtures',
  //   type: 'link',
  //   icon: 'construction',
  //   conditions: [checkUserRole([Role.ADMIN])],
  // },
];

const TEACHER_MENUITEMS: Menu[] = [
  {
    order: 80,
    state: '/web/teacher/manage-students',
    name: 'title.students_registry',
    type: 'link',
    icon: 'groups_2',
    conditions: [checkUserRole([Role.convertFromString('teacher')])],
  },
  {
    order: 81,
    state: '/web/teacher/add-student',
    name: 'title.add_student',
    type: 'link',
    icon: 'person_add_alt',
    conditions: [checkUserRole([Role.convertFromString('teacher')])],
  },
];

// order from 100
const OTHER_ITEMS: Menu[] = [
  {
    order: 100,
    type: 'separator',
  },
  {
    order: 101,
    state: '/web/policy',
    type: 'link',
    name: 'title.policy',
    icon: 'shield',
  },
];

@Injectable({ providedIn: 'root' })
export class MenuItemsService {
  private debug = environment.debug || false;

  public constructor(
    private _us: UserService,
    private _dataBus: DataBusService,
  ) {
    // FIXME: Project dependant logic
    const ua = this._dataBus.currentUser;
    if (this.debug) {
      console.debug(`[Menu Items] ${JSON.stringify(ua?.badges)}`);
    }
    if (ua?.badges && ua.badges?.keys != undefined) {
      ua.badges?.forEach((value: number, key: string) => {
        this.setBadge(key, value);
      });
    }
  }

  private filterMenuItem(
    items: Menu[],
    patient?: Patient,
    userService?: UserService,
  ): Menu[] {
    return (
      items?.filter(
        (mi) =>
          !mi.conditions ||
          mi.conditions.every((c) =>
            c({ patient: patient, userService: userService }),
          ),
      ) || []
    );
  }

  public getMenuitem(patient?: Patient): Menu[] {
    let toRet = [
      ...this.filterMenuItem(ADMIN_MENUITEMS, patient, this._us),
      ...this.filterMenuItem(HCP_MENUITEMS, patient, this._us),
      ...this.filterMenuItem(TEACHER_MENUITEMS, patient, this._us),
      ...this.filterMenuItem(OTHER_ITEMS, patient, this._us),
    ];

    return this.cleanAndOrderMenuItems(toRet);
  }

  private cleanAndOrderMenuItems(items: Menu[]): Menu[] {
    // let toRet = items.filter((v, i) => items.indexOf(v) === i); // toglie i duplicati solo se l'indexOf restituisce l'oggetto corretto
    // non c'è un equals custom nell'interfaccia Menu, e == restituisce false
    // uguaglianza basata solo su state
    let toRet: Menu[] = [];
    items.forEach((i) => {
      const x = toRet.filter((f) => f.state == i.state).length;
      if (x < 1) {
        toRet.push(i);
      }
    });
    toRet = toRet.sort((a, b) => a.order - b.order);
    return toRet;
  }

  public incrementBadge(state: string) {
    let menus: Menu[] = this.getMenuitem();
    let toIncrement = menus.filter((m) => m.state === state);
    if (toIncrement) {
      toIncrement.forEach((m) => {
        if (m.badge) {
          m.badge.value += 1;
        } else {
          m.badge = { value: 1 };
        }
      });
    }
  }

  public setBadge(state: string, num: number) {
    let menus: Menu[] = this.getMenuitem();
    let toIncrement = menus.filter((m) => m.state === state);
    if (toIncrement) {
      toIncrement.forEach((m) => {
        m.badge = { value: num };
      });
    }
  }

  public resetBadge(state: string) {
    let menus: Menu[] = this.getMenuitem();
    let toIncrement = menus.filter((m) => m.state === state);
    if (toIncrement) {
      toIncrement.forEach((m) => {
        if (m.badge) {
          m.badge = undefined;
        }
      });
    }
  }

  public decrementBadge(state: string) {
    let menus: Menu[] = this.getMenuitem();
    let toIncrement = menus.filter((m) => m.state === state);
    if (toIncrement) {
      toIncrement.forEach((m) => {
        if (m.badge) {
          if (m.badge.value > 1) {
            m.badge.value -= 1;
          } else {
            m.badge = undefined;
          }
        }
      });
    }
  }
}
