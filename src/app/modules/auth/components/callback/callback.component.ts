import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SERVER_OIDC } from '@config/server-configuration.conf';
import { environment } from '@env/environment';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';
import { ErrorCodes } from '@config/service/error-codes.enum';
import { Subject, takeUntil } from 'rxjs';
import { LogEvent } from '@modules/service/services/logging.decorator';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';

@Component({
  selector: 'heart-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
})
export class CallbackComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  deblog = environment.debug;
  public isLogged = false;

  constructor(private _auth: AbstractAuthService, private _router: Router) {}

  ngOnInit(): void {
    this._auth
      .observeAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.isLogged = val;
        if (this.isLogged) {
          this.navigateToHome();
        } else {
          if (this._auth.accessToken && environment.enableAuthentication) {
            this.navigateToUnauthorized();
          } else {
            if (this.deblog) {
              console.log(
                `[CallbackComponent] No redirect applied for the unauthenticated user`
              );
            }
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @LogEvent(USER_EVENT_CONSTANTS.USER_LOGGED_IN)
  public navigateToHome(): void {
    this._router.navigateByUrl('/web');
  }

  public navigateToUnauthorized(): void {
    this._router.navigate([SERVER_OIDC.unauthorizedRoute], {
      queryParams: {
        code: ErrorCodes.USER_NOT_LOGGED_OR_WITHOUT_TYPE.toString(),
      },
      replaceUrl: true,
    });
  }
}
