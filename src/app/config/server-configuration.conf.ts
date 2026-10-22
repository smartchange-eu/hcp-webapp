import { environment } from '@env/environment';
import { LogLevel, OpenIdConfiguration } from 'angular-auth-oidc-client';

export const HEART = {
  fhirService: '/base',
  restService: '/rest',
};

export const SHOW_CONTROL_RISK =
  environment.pilotCountry === 'SLO' || environment.pilotCountry === 'FIN';

export const SECURE_ROUTES = {
  routes: [environment.apiUrl, environment.xcdsServiceUrl],
};

// if (environment.enableLogging) {
//   SECURE_ROUTES.routes.push(environment.loggingUrl);
// }

// Initialize OAUTH
export const SERVER_OIDC: OpenIdConfiguration = {
  triggerAuthorizationResultEvent: true,
  postLoginRoute: '/web/',
  forbiddenRoute: '/web/forbidden',
  unauthorizedRoute: '/web/unauthorized',
  // logLevel: environment.debug ? LogLevel.Debug : LogLevel.Warn,
  logLevel: LogLevel.Warn,
  historyCleanupOff: true,
  authority: environment.authBaseUrl + '/realms/' + environment.realm, // FULL URL - auth server url,
  // needs to be an unguarded route to work with oidc auto login guard
  redirectUrl: `${window.location.origin}/web/callback`,
  postLogoutRedirectUri: window.location.origin,
  scope: 'openid profile email offline_access',
  responseType: 'code',
  silentRenew: true,
  useRefreshToken: true,
  // The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified by the iss (issuer) Claim as an audience.
  // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences not trusted by the Client.
  clientId: 'heart-webapp',
  ignoreNonceAfterRefresh: true,
  autoUserInfo: false,

  // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
  // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
  maxIdTokenIatOffsetAllowedInSeconds: 100,
  renewTimeBeforeTokenExpiresInSeconds: 100,
  secureRoutes: SECURE_ROUTES.routes,
  // customParamsAuthRequest: {
  //   ui_locales: LocaleService.DEFAULT_LOCALE.toString(),
  // },
};
