import { HttpWalletApi } from './httpWalletApi';
import { mockWalletApi } from './mockWalletApi';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');
export const isMockApi = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

if (!isMockApi && !configuredBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is required when mock API mode is disabled.');
}

export const walletApi = isMockApi
  ? mockWalletApi
  : new HttpWalletApi(configuredBaseUrl as string);

export { BackendApiError } from './httpWalletApi';
export {
  backendErrorMessage,
  isAuthEmailRateLimited,
  isSessionError,
  loginErrorMessage,
  registrationErrorMessage,
  sessionErrorMessage,
} from './errorMessages';
export { mockWalletApi } from './mockWalletApi';
export { setSessionInvalidatedHandler } from './sessionEvents';
export type * from './types';
