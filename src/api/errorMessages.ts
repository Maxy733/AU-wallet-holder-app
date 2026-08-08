import { BackendApiError } from './httpWalletApi';

export function registrationErrorMessage(error: unknown) {
  if (!(error instanceof BackendApiError)) return 'Registration is temporarily unavailable.';

  switch (error.code) {
    case 'EMAIL_ALREADY_REGISTERED':
      return 'An account already exists for this email. Confirm the email if needed, then log in.';
    case 'REGISTRATION_FAILED':
      return 'We could not create your account. Please check the details and try again.';
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
