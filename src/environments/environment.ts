// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { EnvironmentConfiguration } from './environment-configuration.model';

// FIXME [PROJECT_DEPENDANT]: edit environment variables according to your current Heart distribution
export const environment: EnvironmentConfiguration = {
  production: false,
  debug: true,
  feBasePath: '/assets/i18n/',
  useOidc: true,
  portalUrl: 'http://localhost:4200/',
  apiUrl: 'http://localhost/emr',
  authBaseUrl: 'http://localhost/auth',
  realm: 'smartchange',
  enableAuthentication: true,
  useNotification: false,
  xcdsServiceEnabled: true,
  xcdsServiceUrl: 'http://localhost/xcdsbroker',
  planDuration: 180,
  pilotCountry: 'ITA',
  defaultLanguage: 'en',
  labDefaultUnit: 'MMOL_L',
  bugReportUrl: '',
  visualExplainer: true,
  visualExplainerUrl: '',
  enableLogging: false,
  slofitPidSystem: '',
  testEnv: 'true',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.import { EnvironmentConfiguration } from './environment-configuration.model';
