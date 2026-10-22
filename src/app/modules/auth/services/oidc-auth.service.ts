import { SERVER_OIDC } from '@config/server-configuration.conf';
import { Injectable } from '@angular/core';
import { UserService } from '@modules/service/services/user.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, EMPTY, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AbstractAuthService } from './abstract-auth-service';

@Injectable()
export class OidcAuthService implements AbstractAuthService {
  private iToken: string | undefined;
  private aToken: string | undefined;
  private authorizationFlow$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  constructor(
    private userService: UserService,
    public oidcSecurityService: OidcSecurityService
  ) {
    this.checkAuth();
  }

  public observeAuthenticated(): Observable<boolean> {
    return this.authorizationFlow$.asObservable();
  }

  public async logIn(
    username?: string | undefined,
    password?: string | undefined
  ): Promise<void> {
    this.oidcSecurityService.authorize();
  }

  public async setUser() {}

  public refreshSession() {
    this.oidcSecurityService.authorize();
  }

  public logout() {
    this.oidcSecurityService
      // the custom param is needed to solve a Keycloak issue as it requires the client_id
      .logoff(undefined, { customParams: { 'client_id': this.oidcSecurityService.getConfigurations()[0].clientId! } })
      .subscribe((result) => console.log(result));
  }

  public isLogged(): boolean {
    return this.authorizationFlow$.getValue();
  }

  public get accessToken(): string | undefined {
    return this.aToken;
  }

  public get idToken(): string | undefined {
    return this.iToken;
  }

  public checkAuth() {
    this.oidcSecurityService
      .checkAuth()
      .pipe(
        switchMap(({ accessToken, idToken, userData }) => {
          console.log('[DEBUG] Starting authorization check flow');
          this.iToken = idToken;
          this.aToken = accessToken;

          if (!!userData) {
            const username: string = userData.preferred_username;
            const userId: string = userData.sub;
            const locale: string = userData.locale;
            const resource_access = userData.resource_access as any;
            const roles = resource_access[SERVER_OIDC.clientId!].roles;
            // FIXME: Project dependant on keycloak "UserAttributes AND Clients > Mappers"
            const badges_datasets = userData.badge_datasets;
            const badges: Map<string, number> = new Map();
            if (badges_datasets) {
              badges.set('query/datasets', badges_datasets);
            }
            const currentUser =
              this.userService.validateAndInitAuthenticatedUser({
                userId,
                username,
                locale,
                roles,
                badges,
              });
            if (currentUser) {
              return currentUser;
            } else {
              return throwError(() => 'Error retreiving user data');
            }
          } else {
            return throwError(
              () => 'Session not active or missing authentication payload'
            );
          }

          // return undefined;
        }),
        switchMap(() => {
          this.authorizationFlow$.next(true);

          return EMPTY; // just complete
        }),
        catchError((err: any) => {
          console.error(`[OIDC AUTH]: ${err}`);

          // this.unauthorizedUser();
          this.userService.resetCurrentUser();
          this.oidcSecurityService.logoffLocal();

          this.authorizationFlow$.next(false);

          return EMPTY; // just complete
        })
      )
      .subscribe({
        next: (value: any) => console.log('[OIDC AUTH] auth flow completed'),
        error: (err: any) => console.error(`[OIDC AUTH]: ${err}`),
      });
  }
}
