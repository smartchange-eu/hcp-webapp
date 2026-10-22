import { Role } from '@eng-it4h/heart-ui-model';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavLayoutComponent } from './components/nav-layout/nav-layout.component';
import {
  RedirectHomeRouteGuard,
  RedirectRoute,
} from './services/redirect-home-route.guard';
import { RoleGuard } from '@modules/service/services/guards/role.guard';
import { PolicyComponent } from './components/policy/policy.component';

const routes: Routes = [
  {
    path: '',
    component: NavLayoutComponent,
    children: [
      {
        path: 'policy',
        component: PolicyComponent,
        data: {
          breadcrumb: { skip: false, label: 'hcp.policy.bc' },
        },
      },
      {
        path: 'hcp',
        canLoad: [RoleGuard],
        loadChildren: () =>
          import('../hcp/hcp.module').then((m) => m.HcpModule),
        data: {
          roles: [Role.PRACTITIONER, Role.NURSE],
          breadcrumb: { skip: true, label: 'hcp.page.bc' },
        },
      },
      {
        path: 'admin',
        canActivate: [RoleGuard],
        loadChildren: () =>
          import('../admin/admin.module').then((m) => m.AdminModule),
        // data: { roles: [UserType.ADMIN], breadcrumb: { skip: true } },
        data: {
          roles: [Role.ADMIN],
          breadcrumb: { skip: false, label: 'admin.page.bc' },
        },
      },
      {
        path: 'teacher',
        canActivate: [RoleGuard],
        loadChildren: () =>
          import('../teacher/teacher.module').then((m) => m.TeacherModule),
        // data: { roles: [UserType.ADMIN], breadcrumb: { skip: true } },
        data: {
          roles: [Role.convertFromString('teacher')],
          breadcrumb: { skip: false, label: 'teacher.page.bc' },
        },
      },
      {
        path: 'home',
        pathMatch: 'full',
        canActivate: [RedirectHomeRouteGuard],
        children: [],
        data: {
          routes: [
            {
              navigate: ['./web/admin'],
              roles: [Role.ADMIN],
            } as RedirectRoute,
            {
              navigate: ['./web/hcp'],
              roles: [Role.PRACTITIONER, Role.NURSE],
            } as RedirectRoute,
            {
              navigate: ['./web/teacher'],
              roles: [Role.convertFromString('teacher')],
            } as RedirectRoute,
          ],
        },
      },
      { path: '**', redirectTo: 'home' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoreRoutingModule {}
