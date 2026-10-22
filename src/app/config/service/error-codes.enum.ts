export enum ErrorCodes {
    // navigates to unauthorizedRoute in case of error during the login (code flow) and in case of error and triggerAuthorizationResultEvent is false
    NOT_AUTHORIZED_ON_OIDC_SERVER = '0001' as any,
    USER_NOT_LOGGED_OR_WITHOUT_TYPE = '0002' as any,
    USER_NOT_LOGGED_OR_NOT_ADMIN = '0003' as any,
    BACKEND_CALL_NOT_AUTHORIZED = '0004' as any,
    TIMEOUT_ERROR = '0005' as any,
}
