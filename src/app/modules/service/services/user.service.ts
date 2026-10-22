import { Injectable } from '@angular/core';
import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';
import {
  HealthCareProfessional,
  Locale,
  Role,
  User,
} from '@eng-it4h/heart-ui-model';
import { intersection } from 'lodash-es';
import { DataBusService } from './data-bus.service';
import { LocaleService } from './locale.service';

export class UserAttributes {
  userId?: string;
  username?: string;
  locale?: string;
  roles?: string[];
  badges?: Map<string, number>;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private _connector: HeartUiConnectorService,
    private _localeService: LocaleService,
    private _dataBus: DataBusService
  ) {}

  public async validateAndInitAuthenticatedUser(
    ua: UserAttributes
  ): Promise<User | undefined> {
    let userTypes = ua.roles?.map((r: string) => Role.convertFromString(r));
    if (!userTypes || userTypes.length === 0) {
      userTypes = undefined; //[Role.GUEST];
    } else if (
      // userTypes?.includes(Role.ADMIN) ||
      // userTypes?.includes(Role.PRACTITIONER) ||
      // userTypes?.includes(Role.RESEARCHER)

      // any user role is fine but 'PATIENT' (the route guards are used as finer-grain control check )
      !userTypes?.includes(Role.PATIENT)
    ) {
      let userInfo: HealthCareProfessional | undefined;

      try {
        userInfo =
          await this._connector.practitionerConnector.searchPractitionerByUUID(
            ua.userId
          );
      } catch (error) {
        throw Error('User not found in the EMR');
      }

      const currentUser = new User({
        id: userInfo?.id,
        username: ua.username,
        person: userInfo,
        logged: true,
        enabled: true,
        badges: ua.badges ? ua.badges : undefined,
      });

      const userLocale = ua.locale
        ? Locale.convertFromString(ua.locale.substring(0, 2))
        : undefined;
      if (userLocale) {
        currentUser.locale = userLocale;
        this._localeService.currentLanguage = currentUser.locale!;
      }
      if (!currentUser.roles || currentUser.roles.length == 0) {
        throw Error('User must have associated roles to access the portal');
      }

      this._dataBus.currentUser = currentUser;
      return currentUser;
    } else {
      throw Error(
        `The role(s) ${userTypes.join(
          ', '
        )} are not authorized to log-in the portal`
      );
    }
    return undefined;
  }

  //check if the current user has one of the roles passed as argument
  public checkRoles(roles: Role[]): boolean {
    if (this._dataBus.currentUser == undefined) {
      return false;
    } else {
      return intersection(roles, this._dataBus.currentUser.roles!).length > 0;
    }
  }
  resetCurrentUser() {
    this._dataBus.currentUser = undefined;
  }
  /**************************************
   * UTILITIES
   **************************************/
  /**
   * Create a GUEST user (used for dev purposes)
   */
  public static instanciateGuestUser() {
    console.log('[ERROR] UserService: the guest user not allowed anymore!!!');
    // const user: User = new User({
    // 	logged: false,
    // 	roles: undefined, //[Role.GUEST],
    // 	enabled: true,
    // });

    // return user;
  }
}
