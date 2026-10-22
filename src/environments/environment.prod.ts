import { EnvironmentConfiguration } from './environment-configuration.model';

// FIXME [PROJECT_DEPENDANT]: edit environment variables according to your current Heart distribution
export const environment: EnvironmentConfiguration = {
  production: true,
  debug: false,
  feBasePath: '/assets/i18n/',
  useOidc: false,
  portalUrl: 'http://base_heart_url:4200/',
  apiUrl: 'http://base_heart_url/emr',
  authBaseUrl: 'https://base_heart_url/auth',
  realm: 'smartchange',
  enableAuthentication: true,
  useNotification: false,
  xcdsServiceEnabled: true,
  xcdsServiceUrl: 'http://base_heart_url/xcdsbroker',
  planDuration: 180,
  pilotCountry: 'ITA',
  defaultLanguage: 'en',
  labDefaultUnit: 'MMOL_L',
  bugReportUrl: '',
  visualExplainer: true,
  visualExplainerUrl: '',
  enableLogging: false,
  slofitPidSystem: '',
  testEnv: 'false',
};
