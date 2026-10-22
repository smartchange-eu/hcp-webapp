export type LabDefaultUnit = 'MMOL_L' | 'MG_DL';

export interface EnvironmentConfiguration {
  planDuration: number;
  production: boolean;
  debug: boolean;
  feBasePath: string;
  useOidc: boolean;
  portalUrl: string;
  apiUrl: string;
  enableLogging: boolean;
  authBaseUrl: string;
  realm: string;
  enableAuthentication: boolean;
  useNotification: boolean;
  xcdsServiceEnabled: boolean;
  xcdsServiceUrl: string;
  pilotCountry: string;
  defaultLanguage: string;
  labDefaultUnit: LabDefaultUnit;
  bugReportUrl: string;
  visualExplainer: boolean;
  visualExplainerUrl: string;
  slofitPidSystem: string;
  testEnv: string;
}
