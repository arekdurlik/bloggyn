export const OVERLAY_ID = 'overlay';
export const HEADER_ID = 'header';

export enum SOCKET_EV {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
    NOTIFICATION = 'notification',
    NOTIFY = 'n',
}

export enum SignUpStep {
    SIGN_UP = 'sign-up',
    VERIFY_EMAIL = 'verify-email',
    ONBOARDING = 'onboarding',
}
