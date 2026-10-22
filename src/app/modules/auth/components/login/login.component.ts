import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AbstractAuthService } from '@modules/auth/services/abstract-auth-service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  deblog = environment.debug;
  loginForm: FormGroup;
  public isLogged = false;
  constructor(
    private fb: FormBuilder,
    private _auth: AbstractAuthService,
    private _router: Router
  ) {
    this.loginForm = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this._auth
      .observeAuthenticated()
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.isLogged = val;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onSubmit(): void {
    const user = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    if (user != undefined && password != undefined) {
      const source$ = this._auth.logIn(user, password);
      source$.then((res) => {
        console.log(res);
        if (res == true) {
          this.navigateToHome();
        } else {
          console.error((res as any).text);
          this._router.navigateByUrl('/web/unauthorized');
        }
      });
    }
  }

  public navigateToHome(): void {
    this._router.navigateByUrl('/web');
  }
}
