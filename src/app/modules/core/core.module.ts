import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuItemsService } from './services/menu-items.service';

import { SharedModule } from '@modules/shared/shared.module';
import { ForbiddenComponent } from './components/forbidden/forbidden.component';
import { NavLayoutComponent } from './components/nav-layout/nav-layout.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PolicyComponent } from './components/policy/policy.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { CoreRoutingModule } from './core-routing.module';
import { RedirectHomeRouteGuard } from './services/redirect-home-route.guard';

import { MatDialogModule } from '@angular/material/dialog';
import { PatientMiniCardModule } from '@eng-it4h/heart-ui-patient';
import { IfInRoleDirective } from '@modules/service/services/directives/if-in-role.directive';
import { TranslateModule } from '@ngx-translate/core';
import { InterventionPatientSessionGuard } from './services/intervention-patient-session.guard';
import { PatientSessionGuard } from './services/patient-session.guard';
import { EncounterSessionGuard } from './services/encounter-session.guard';
import { PrescriptionRouteGuard } from './services/prescription-route.guard';

@NgModule({
  declarations: [
    NotFoundComponent,
    ForbiddenComponent,
    UnauthorizedComponent,
    NavLayoutComponent,
    PolicyComponent,
    IfInRoleDirective,
  ],
  imports: [
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    CoreRoutingModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    PatientMiniCardModule,
    TranslateModule.forChild(),
    MatDialogModule,
  ],
  exports: [
    NotFoundComponent,
    ForbiddenComponent,
    UnauthorizedComponent,
    NavLayoutComponent,
  ],
  providers: [
    RedirectHomeRouteGuard,
    MenuItemsService,
    PatientSessionGuard,
    EncounterSessionGuard,
    PrescriptionRouteGuard,
    InterventionPatientSessionGuard,
  ],
})
export class CoreModule {}
