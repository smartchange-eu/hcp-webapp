import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { OidcAuthService } from './oidc-auth.service';

@Injectable({
  providedIn: 'root',
  useClass: environment.useOidc ? OidcAuthService : AuthService,
})
export abstract class AbstractAuthService {
  public abstract logIn(
    username?: string,
    password?: string
  ): Promise<boolean | string | void>;

  public abstract logout(): void;

  public abstract isLogged(): boolean;

  public abstract get accessToken(): string | undefined;

  public abstract get idToken(): string | undefined;

  public abstract observeAuthenticated(): Observable<boolean>;

  public abstract checkAuth(): void;
}
