import { enGB, fi, pt, sl, zhTW, nl } from 'date-fns/locale';
import { Locale, TranslationLanguage } from '@eng-it4h/heart-ui-model';
import {
  sl as sub_sl,
  en as sub_en,
  pt as sub_pt,
  fi as sub_fi,
  tw as sub_tw,
  nl as sub_nl,
} from './translations/subtranslates';
import { environment } from '@env/environment';

export class LanguageConfig {
  public static readonly SUPPORTED_LANGUAGES: Map<Locale, TranslationLanguage> =
    new Map<Locale, TranslationLanguage>([
      [
        Locale.EN,
        {
          display: 'English',
          fnsAdapterLocale: enGB,
          nativeAdapterLocale: 'en-GB',
          locale: Locale.EN,
          subtranslateDicionary: sub_en,
        },
      ],
      [
        Locale.SL,
        {
          display: 'Slovenian - slovenščina',
          fnsAdapterLocale: sl,
          nativeAdapterLocale: 'sl',
          locale: Locale.SL,
          subtranslateDicionary: sub_sl,
        },
      ],
      [
        Locale.PT,
        {
          display: 'Portuguese - português',
          fnsAdapterLocale: pt,
          nativeAdapterLocale: 'pt-pt',
          locale: Locale.PT,
          subtranslateDicionary: sub_pt,
        },
      ],
      [
        Locale.FI,
        {
          display: 'Finnish - suomi',
          fnsAdapterLocale: fi,
          nativeAdapterLocale: 'fi',
          locale: Locale.FI,
          subtranslateDicionary: sub_fi,
        },
      ],
      [
        Locale.TW,
        {
          display: 'Traditional Chinese - 繁體中文',
          fnsAdapterLocale: zhTW,
          nativeAdapterLocale: 'zh-tw',
          locale: Locale.TW,
          subtranslateDicionary: sub_tw,
        },
      ],
      [
        Locale.NL,
        {
          display: 'Dutch - Nederlands',
          fnsAdapterLocale: nl,
          nativeAdapterLocale: 'nl',
          locale: Locale.NL,
          subtranslateDicionary: sub_nl,
        },
      ],
    ]);

  public static readonly DEFAULT_LOCALE: Locale =
    Locale.convertFromString(environment.defaultLanguage) ?? Locale.EN;

  public static readonly DEFAULT_LANGUAGE: TranslationLanguage =
    LanguageConfig.SUPPORTED_LANGUAGES.get(LanguageConfig.DEFAULT_LOCALE)!;
}
