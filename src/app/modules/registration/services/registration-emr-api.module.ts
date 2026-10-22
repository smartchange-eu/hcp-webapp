import { NgModule } from '@angular/core';
import {
  ApiModule,
  Configuration,
  ConfigurationParameters,
} from './registration-api';
import { SharedModule } from '@modules/shared/shared.module';
import { environment } from '@env/environment';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.apiUrl,
  };
  return new Configuration(params);
}
@NgModule({
  declarations: [],
  imports: [SharedModule, ApiModule.forRoot(apiConfigFactory)],
})
export class RegistrationEmrApiModule {}
