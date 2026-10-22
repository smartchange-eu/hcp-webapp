import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-oidc-login',
  templateUrl: './oidc-login.component.html',
  styleUrls: ['./oidc-login.component.scss'],
})
export class OidcLoginComponent implements OnInit, OnDestroy {
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
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public navigateToHome(): void {
    this._router.navigateByUrl('/web');
  }

  submit(): void {
    this._auth.logIn();
  }
}
