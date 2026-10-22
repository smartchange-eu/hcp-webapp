import { UserEventDTO } from './../../user-events-api/openapi/model/userEventDTO';
import { UserEventControllerService } from './../../user-events-api/openapi/api/userEventController.service';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';
import { environment } from '@env/environment';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';

@Injectable({
  providedIn: 'root',
})
export class UserEventsLogService {
  private sessionKey = 'anonymous_session_id';
  private _sessionId: string;
  constructor(
    private router: Router,
    private logService: UserEventControllerService,
    private auth: AbstractAuthService
  ) {
    this._sessionId = this.getOrCreateSessionId();
    this.trackPageViews();
  }

  private getOrCreateSessionId(): string {
    let id = sessionStorage.getItem(this.sessionKey);
    if (!id) {
      id = self.crypto.randomUUID();
      sessionStorage.setItem(this.sessionKey, id);
    }
    return id;
  }

  get sessionId(): string {
    return this._sessionId;
  }

  /** Track Angular route changes (page opens) */
  private trackPageViews(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((nav) => {
        this.logEvent(USER_EVENT_CONSTANTS.USER_NAVIGATED, {
          url: nav.urlAfterRedirects,
        });
      });
  }

  /** Generic event logger */
  public logEvent(
    type: USER_EVENT_CONSTANTS,
    data: Record<string, any> = {}
  ): void {
    const event: UserEventDTO = {
      type: type,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      data: data,
    };
    if (environment.enableLogging && this.auth.isLogged()) {
      this.logService.logEvent(event).subscribe({
        error: (err) => console.error('Logging error', err),
      });
    } else {
      console.trace(`[${event.timestamp}] ${event.type} - ${event.data}`);
    }
  }
}
