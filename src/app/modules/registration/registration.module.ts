import { NgModule } from '@angular/core';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegisterComponent } from './components/register/register.component';
import { SharedModule } from '@modules/shared/shared.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RegistrationEmrApiModule } from './services/registration-emr-api.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    SharedModule,
    TranslateModule.forChild(),
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    RegistrationEmrApiModule,
    RegistrationRoutingModule,
  ],
})
export class RegistrationModule {}
