export const OVERLAY_ID = 'overlay';
export const IMAGE_OVERLAY_ID = 'img-overlay';

export const HEADER_ID = 'header';

export const CALLBACK_PARAM = 'cb';
export const LATEST_ACTORS_MAX_AMOUNT = 2;

export enum SocketEvent {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
    SUBSCRIBED = 'subscribed',
    NOTIFICATION = 'notification',
    NOTIFY = 'n',
}

export enum SignUpStep {
    SIGN_UP = 'sign-up',
    VERIFY_EMAIL = 'verify-email',
    ONBOARDING = 'onboarding',
    SUCCESS = 'success',
}

export enum NotificationType {
    LIKE = 'like',
    POST = 'post',
    FOLLOW = 'follow',
}

export enum NotificationTargetType {
    POST = 'post',
    USER = 'user',
}

export enum Cookie {
    THEME = 'theme',
    UNREAD_NOTIFICATIONS = 'unread-notifications',
}
