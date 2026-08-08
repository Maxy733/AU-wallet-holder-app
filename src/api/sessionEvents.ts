export type SessionInvalidationReason =
  | 'ACCESS_TOKEN_INVALID_OR_EXPIRED'
  | 'REFRESH_TOKEN_INVALID_OR_EXPIRED'
  | 'ACCOUNT_DISABLED'
  | 'AUTHENTICATION_REQUIRED';

type SessionInvalidatedHandler = (reason: SessionInvalidationReason) => void;

let sessionInvalidatedHandler: SessionInvalidatedHandler | null = null;

export function setSessionInvalidatedHandler(handler: SessionInvalidatedHandler) {
  sessionInvalidatedHandler = handler;
  return () => {
    if (sessionInvalidatedHandler === handler) sessionInvalidatedHandler = null;
  };
}

export function notifySessionInvalidated(reason: SessionInvalidationReason) {
  sessionInvalidatedHandler?.(reason);
}
