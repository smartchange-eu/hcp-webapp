import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AbstractAuthService } from './abstract-auth-service';
import {
  UserAttributes,
  UserService,
} from '@modules/service/services/user.service';
import { environment } from '@env/environment';

const defaultAdmin: UserAttributes = {
  userId: '',
  username: '',
  locale: 'EN',
  roles: ['ADMIN'],
  badges: new Map<string, number>(),
};

@Injectable()
export class AuthService implements AbstractAuthService {
  private loggedIn: boolean = false;

  constructor(private userService: UserService) {
    console.log('injected AS');
  }
  public checkAuth(): void {
    console.log('[DEBUG] Starting fake authorization check flow');
    if (!environment.production) {
      this.userService
        .validateAndInitAuthenticatedUser(defaultAdmin)
        .then((user) => {
          this.loggedIn = !!user;
        });
    }
  }

  public observeAuthenticated(): Observable<boolean> {
    return of(this.loggedIn);
  }

  public async logIn(
    username: string,
    password: string
  ): Promise<boolean | string> {
    this.loggedIn = true;
    return true;
  }

  public isLogged(): boolean {
    return this.loggedIn;
  }

  public logout() {
    this.loggedIn = false;
  }

  public get accessToken(): string | undefined {
    return undefined;
  }

  public get idToken(): string | undefined {
    return undefined;
  }
}
