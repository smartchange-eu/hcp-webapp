import { environment as defaultEnv } from './environment.prod'; // if not set from the environment the PROD settings are used

import { EnvironmentConfiguration } from './environment-configuration.model';

// FIXME [PROJECT_DEPENDANT]: edit environment variables according to your current Heart distribution
// OVERRIDE by the docker-compose variables
export const environment: EnvironmentConfiguration = {
  production: true,
  debug: false,
  feBasePath: '/assets/i18n/',
  useOidc: true,
  enableLogging: true,
  portalUrl: ((window as any).env?.portalUrl || defaultEnv.portalUrl).replace(
    /\/$/,
    '',
  ),
  apiUrl: ((window as any).env?.apiUrl || defaultEnv.apiUrl).replace(/\/$/, ''),
  authBaseUrl: (
    (window as any).env?.authBaseUrl || defaultEnv.authBaseUrl
  ).replace(/\/$/, ''),
  realm: ((window as any).env?.realm || defaultEnv.realm).replace(/\/$/, ''),
  enableAuthentication: true,
  useNotification: false,
  xcdsServiceEnabled:
    (window as any).env?.xcdsServiceEnabled || defaultEnv.xcdsServiceEnabled,
  xcdsServiceUrl: (
    (window as any).env?.xcdsServiceUrl || defaultEnv.xcdsServiceUrl
  ).replace(/\/$/, ''),
  planDuration: (window as any).env?.planDuration || defaultEnv.planDuration,
  pilotCountry: (window as any).env?.pilotCountry || defaultEnv.pilotCountry,
  defaultLanguage:
    (window as any).env?.defaultLanguage || defaultEnv.defaultLanguage,
  labDefaultUnit:
    (window as any).env?.labDefaultUnit || defaultEnv.labDefaultUnit,
  bugReportUrl: (
    (window as any).env?.bugReportUrl || defaultEnv.bugReportUrl
  ).replace(/\/$/, ''),
  visualExplainer:
    (window as any).env?.visualExplainer || defaultEnv.visualExplainer,
  visualExplainerUrl: (
    (window as any).env?.visualExplainerUrl || defaultEnv.visualExplainerUrl
  ).replace(/\/$/, ''),
  slofitPidSystem: (
    (window as any).env?.slofitPidSystem || defaultEnv.slofitPidSystem
  ).replace(/\/$/, ''),
  testEnv: ((window as any).env?.testEnv || defaultEnv.testEnv).replace(
    /\/$/,
    '',
  ),
};
