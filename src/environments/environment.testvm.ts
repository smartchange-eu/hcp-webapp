import { EnvironmentConfiguration } from './environment-configuration.model';

export const environment: EnvironmentConfiguration = {
  production: false,
  debug: true,
  feBasePath: '/assets/i18n/',
  useOidc: true,
  portalUrl: 'http://localhost:4200/',
  apiUrl: 'https://test.smart-change.eu/emr',
  authBaseUrl: 'https://test.smart-change.eu/auth',
  realm: 'smartchange',
  enableAuthentication: true,
  useNotification: false,
  xcdsServiceEnabled: true,
  xcdsServiceUrl: 'https://test.smart-change.eu/xcdsbroker',
  planDuration: 180,
  pilotCountry: 'FIN',
  defaultLanguage: 'en',
  labDefaultUnit: 'MG_DL',
  bugReportUrl: 'https://forms.gle/UW1rAChHHgqAudSN9',
  visualExplainer: true,
  visualExplainerUrl: 'https://test.smart-change.eu/visualExplainer',
  enableLogging: false,
  slofitPidSystem: 'http://smart-change.eu/slofit/pid',
  testEnv: 'true',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
