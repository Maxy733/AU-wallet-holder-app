import { BackendApiError } from './httpWalletApi';

const SAFE_VALIDATION_MESSAGE = 'Please check the information you entered.';
const SAFE_EMAIL_RATE_LIMIT_MESSAGE = 'Too many confirmation emails were requested. Please wait before trying again.';

export function isAuthEmailRateLimited(error: unknown) {
  return error instanceof BackendApiError && error.code === 'AUTH_EMAIL_RATE_LIMITED';
}

export function backendErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof BackendApiError)) return fallback;
  if (error.code === 'VALIDATION_ERROR') return SAFE_VALIDATION_MESSAGE;
  if (error.code === 'AUTH_EMAIL_RATE_LIMITED') return SAFE_EMAIL_RATE_LIMIT_MESSAGE;
  return error.message;
}

export function registrationErrorMessage(error: unknown) {
  if (!(error instanceof BackendApiError)) return 'Registration is temporarily unavailable.';

  switch (error.code) {
    case 'EMAIL_ALREADY_REGISTERED':
      return 'An account already exists for this email. Confirm the email if needed, then log in.';
    case 'REGISTRATION_FAILED':
      return 'We could not create your account. Please check the details and try again.';
    case 'AUTH_EMAIL_RATE_LIMITED':
      return SAFE_EMAIL_RATE_LIMIT_MESSAGE;
    case 'VALIDATION_ERROR':
      return SAFE_VALIDATION_MESSAGE;
    default:
      return error.message;
  }
}

export function loginErrorMessage(error: unknown) {
  if (!(error instanceof BackendApiError)) return 'Login is temporarily unavailable.';

  switch (error.code) {
    case 'EMAIL_NOT_CONFIRMED':
      return 'Confirm your email first, then return to the wallet and log in.';
    case 'INVALID_CREDENTIALS':
      return 'The email or password is incorrect.';
    case 'ACCOUNT_DISABLED':
      return 'This account is currently unavailable. Contact the wallet support team.';
    case 'VALIDATION_ERROR':
      return SAFE_VALIDATION_MESSAGE;
    default:
      return error.message;
  }
}

export function sessionErrorMessage(code: string) {
  return code === 'ACCOUNT_DISABLED'
    ? 'This account is currently unavailable. Contact the wallet support team.'
    : 'Your session expired. Please log in again.';
}

export function isSessionError(error: unknown) {
  return error instanceof BackendApiError && [
    'ACCESS_TOKEN_INVALID_OR_EXPIRED',
    'REFRESH_TOKEN_INVALID_OR_EXPIRED',
    'AUTHENTICATION_REQUIRED',
    'ACCOUNT_DISABLED',
  ].includes(error.code);
}
