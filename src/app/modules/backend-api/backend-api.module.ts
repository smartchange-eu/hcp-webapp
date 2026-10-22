import { NgModule } from '@angular/core';
import { ApiModule } from './openapi';
import { SharedModule } from '@modules/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [SharedModule, ApiModule],
})
export class BackendApiModule {}
