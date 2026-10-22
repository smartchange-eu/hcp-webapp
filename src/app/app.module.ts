import { Injector, NgModule } from '@angular/core';
import { AuthModule } from './modules/auth/auth.module';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LanguageConfig } from '@config/language.conf';
import { Locale } from '@eng-it4h/heart-ui-model';
import { SubTranslateModule } from '@eng-it4h/heart-ui-utils';
import { BackendApiModule } from '@modules/backend-api/backend-api.module';
import { ServiceModule } from '@modules/service/service.module';
import { SlofitEmrApiModule } from '@modules/slofit-emr-api/slofit-emr-api.module';
import { UserEventsApiModule } from '@modules/user-events-api/user-events-api.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import pkg from '../../package.json';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

export function HttpLoaderFactory(http: HttpClient) {
  const base = environment.feBasePath;
  console.info(`Prefix is used for the i18n: ${base}. Version: ${pkg.version}`);
  return new TranslateHttpLoader(http, base, '.json?v=' + pkg.version);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    TranslateModule.forRoot({
      defaultLanguage: Locale.EN,
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false, // isolate property is the key point to remember/
      extend: true,
    }),
    SubTranslateModule.forRoot({
      defaultLanguage: Locale.EN,
      overwriteInitial: false,
      useTranslateServiceFirst: true,
      locales: LanguageConfig.SUPPORTED_LANGUAGES,
    }),
    HttpClientModule,
    BrowserAnimationsModule,
    ServiceModule.forRoot(),
    AuthModule,
    AppRoutingModule,
    BackendApiModule,
    UserEventsApiModule,
    SlofitEmrApiModule,
  ],
  providers: [TranslateModule],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {
  static injector: Injector;
  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}
