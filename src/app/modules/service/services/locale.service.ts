import {
  Injectable,
  Inject,
  Optional,
  // LOCALE_ID,
  Renderer2,
  RendererFactory2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { TranslateService } from '@ngx-translate/core';

import { DateFnsConfigurationService } from 'ngx-date-fns';

import { Locale, TranslationLanguage } from '@eng-it4h/heart-ui-model';
import { LanguageConfig } from '@config/language.conf';

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  private renderer: Renderer2;

  private _currentLanguage: TranslationLanguage =
    LanguageConfig.DEFAULT_LANGUAGE;

  public constructor(
    @Inject(DOCUMENT) private doc: Document,
    rendererFactory: RendererFactory2,
    @Optional() private oidcSecurityService: OidcSecurityService,
    public translateService: TranslateService,
    public dateFns: DateFnsConfigurationService // DATE locales // private _dateAdapter: DateAdapter<Date>,
  ) {
    // in a service we cannot import directly renderer2, but it must be obtained by the RendererFactory2:
    this.renderer = rendererFactory.createRenderer(null, null);
    // init language in application:
    this.translateService.addLangs([
      ...LanguageConfig.SUPPORTED_LANGUAGES.keys(),
    ]);

    this.currentLanguage = Locale.convertFromString(
      this.translateService.getBrowserLang()!
    );
  }

  public get currentLanguage(): Locale {
    return this._currentLanguage.locale;
  }

  public set currentLanguage(newLocale: Locale) {
    // if the new locale is not undefined and is supported use it
    if (newLocale && LanguageConfig.SUPPORTED_LANGUAGES.has(newLocale)) {
      this._currentLanguage =
        LanguageConfig.SUPPORTED_LANGUAGES.get(newLocale)!;
    } else {
      // otherwise use the fallback
      this._currentLanguage = LanguageConfig.DEFAULT_LANGUAGE;
    }

    // modify lang attribute in index.html:
    // To adapt the <html lang="en"> tag in index.html to modify the lang based on which language we want to view the application in:
    this.renderer.setAttribute(
      this.doc.documentElement,
      'lang',
      this._currentLanguage.locale.toString()
    );
    // in alternativa: this.doc.documentElement.lang = this.locale;

    this.translateService.use(this._currentLanguage.locale.toString());

    // 'DateFNs' locale is related to logged user, for obtaining a calendar week starting from monday or sunday (or another day) relative to his language

    this.dateFns.setLocale(this._currentLanguage.fnsAdapterLocale);
    // this._dateAdapter.setLocale(this._locale);

    if (this.oidcSecurityService) {
      this.oidcSecurityService
        ?.getConfiguration()
        .subscribe((configuration) => {
          if (configuration) {
            if (!configuration.customParamsAuthRequest) {
              configuration.customParamsAuthRequest = {};
            }

            configuration.customParamsAuthRequest['ui_locales'] =
              this._currentLanguage.locale.toString();
          }
        });
    }
  }

  public getSupportedLanguages(): TranslationLanguage[] {
    return [...LanguageConfig.SUPPORTED_LANGUAGES.values()];
  }
}
