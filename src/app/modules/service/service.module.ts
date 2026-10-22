import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import {
  ConnectorModule,
  ConnectorModuleConfig,
  ExceptionHandlerService,
  HeartUiBackendConnectorService,
  HeartUiConnectorService,
} from '@eng-it4h/heart-ui-connector';
import { SnackbarModule } from '@eng-it4h/heart-ui-utils';

import { HEART } from '@config/server-configuration.conf';
import { HeartUiCdssModule } from '@eng-it4h/heart-ui-cdss';
import { environment } from '@env/environment';
import { CustomExceptionHandler } from './services/connector-exception-handler.service';

const connectorConfig: ConnectorModuleConfig = {
  fhirBaseFullUrl: environment.apiUrl + HEART.fhirService,
  restServiceFullUrl: environment.apiUrl + HEART.restService,
  connectorService: {
    provide: HeartUiConnectorService,
    useClass: HeartUiBackendConnectorService,
  },
  exceptionHandler: {
    provide: ExceptionHandlerService,
    useClass: CustomExceptionHandler,
  },
};

@NgModule({
  declarations: [],
  imports: [
    ConnectorModule.forRoot(connectorConfig),
    SnackbarModule,
    HeartUiCdssModule.forRoot({
      cdssUrl: environment.xcdsServiceUrl!,
    }),
  ],
})
export class ServiceModule {
  public static forRoot(): ModuleWithProviders<ServiceModule> {
    return {
      ngModule: ServiceModule,
      providers: [],
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: ServiceModule) {
    if (parentModule) {
      throw new Error(
        'ServiceModule is already loaded. Import in your base AppModule only.'
      );
    }
  }
}
