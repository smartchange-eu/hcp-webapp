import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FakeHttpInterceptor } from './services/fake-http.interceptor';

import { LayoutModule } from '@angular/cdk/layout';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SERVER_OIDC } from '@config/server-configuration.conf';
import { environment } from '@env/environment';
import {
  AuthModule as AngularOauthModule,
  AuthInterceptor,
} from 'angular-auth-oidc-client';
import { AuthComponent } from './components/auth/auth.component';
import { CallbackComponent } from './components/callback/callback.component';
import { LoginComponent } from './components/login/login.component';
import { OidcLoginComponent } from './components/oidc-login/oidc-login.component';
import { SharedModule } from '@modules/shared/shared.module';

// import dev only modules
let oidc = [
  AngularOauthModule.forRoot({
    config: SERVER_OIDC,
  }),
];

// if production clear dev imports and set to prod mode
if (!environment.useOidc) {
  oidc = [];
}

@NgModule({
  declarations: [
    LoginComponent,
    OidcLoginComponent,
    AuthComponent,
    CallbackComponent,
  ],
  imports: [
    SharedModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    MatIconModule,
    LayoutModule,
    ...oidc,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: environment.useOidc ? AuthInterceptor : FakeHttpInterceptor,
      multi: true,
    },
  ],
  exports: [AuthComponent],
})
export class AuthModule {
  constructor(@Optional() @SkipSelf() parentModule?: AuthModule) {
    if (parentModule) {
      throw new Error(
        'AuthModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
