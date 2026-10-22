import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '@env/environment';
import { AuthComponent } from '@modules/auth/components/auth/auth.component';
import { CallbackComponent } from '@modules/auth/components/callback/callback.component';
import { AuthGuard } from '@modules/auth/services/auth.guard';
import { ForbiddenComponent } from '@modules/core/components/forbidden/forbidden.component';
import { NotFoundComponent } from '@modules/core/components/not-found/not-found.component';
import { UnauthorizedComponent } from '@modules/core/components/unauthorized/unauthorized.component';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';

const authGuards = [];
if (environment.enableAuthentication && environment.useOidc) {
  authGuards.push(AutoLoginPartialRoutesGuard);
} else {
  authGuards.push(AuthGuard);
}

const registrationPath =
  !environment.production || environment.testEnv == 'true'
    ? [
        {
          path: 'register',
          loadChildren: () =>
            import('./modules/registration/registration.module').then(
              (m) => m.RegistrationModule,
            ),
          data: { breadcrumb: { skip: true } },
        },
      ]
    : [];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'web',
    pathMatch: 'full',
    data: { breadcrumb: { skip: true } },
  },
  {
    path: 'web',
    children: [
      { path: 'auth', component: AuthComponent },
      { path: 'callback', component: CallbackComponent },
      { path: 'unauthorized', component: UnauthorizedComponent },
      { path: 'forbidden', component: ForbiddenComponent },
      ...registrationPath,
      // empty must be last, unless pathmatch = full
      {
        path: '',
        canLoad: authGuards,
        loadChildren: () =>
          import('./modules/core/core.module').then((m) => m.CoreModule),
        data: { breadcrumb: { skip: true } },
      },
    ],
    data: { breadcrumb: { skip: true } },
  },
  { path: '**', component: NotFoundComponent }, // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
