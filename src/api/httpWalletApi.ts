import type {
  ApiErrorBody,
  ApiSuccess,
  AuthMe,
  AuthMeResponse,
  AuthSession,
  HolderAccount,
  IssuerProvider,
  LoginInput,
  OnboardingRequest,
  OnboardingSubmission,
  RegistrationInput,
  RegistrationResult,
  WalletBackendApi,
} from './types';
import { clearApiSession, readApiSession, saveApiSession } from './secureSession';
import { notifySessionInvalidated } from './sessionEvents';

export class BackendApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  authenticated?: boolean;
  retryAfterRefresh?: boolean;
};

export class HttpWalletApi implements WalletBackendApi {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number | null = null;
  private sessionLoaded = false;

  constructor(private readonly baseUrl: string) {}

  private async setSession(session: AuthSession) {
    await saveApiSession('live', {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    });
    this.accessToken = session.accessToken;
    this.refreshToken = session.refreshToken;
    this.expiresAt = session.expiresAt;
    this.sessionLoaded = true;
  }

  private async clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
    this.sessionLoaded = true;
    await clearApiSession('live');
  }

  private async loadSession() {
    if (this.sessionLoaded) return;
    const stored = await readApiSession('live');
    this.accessToken = stored?.accessToken ?? null;
    this.refreshToken = stored?.refreshToken ?? null;
    this.expiresAt = stored?.expiresAt ?? null;
    this.sessionLoaded = true;
  }

  async hasStoredSession() {
    await this.loadSession();
    return Boolean(this.accessToken && this.refreshToken);
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.authenticated) {
      await this.loadSession();
      if (!this.accessToken) {
        throw new BackendApiError('ACCESS_TOKEN_INVALID_OR_EXPIRED', 'Please log in again.', 401);
      }
      if (
        this.expiresAt !== null &&
        this.expiresAt <= Math.floor(Date.now() / 1000) &&
        options.retryAfterRefresh !== false
      ) {
        await this.refresh();
        return this.request<T>(path, { ...options, retryAfterRefresh: false });
      }
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new BackendApiError(
        'SERVICE_UNAVAILABLE',
        'The wallet backend is not reachable. Check the configured API address.',
        503,
      );
    }

    const payload = await response.json().catch(() => null) as ApiSuccess<T> | ApiErrorBody | null;

    if (!response.ok) {
      const error = payload && 'error' in payload ? payload.error : {
        code: response.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'INTERNAL_ERROR',
        message: 'The wallet backend returned an unexpected response.',
        details: [],
      };

      if (
        error.code === 'ACCESS_TOKEN_INVALID_OR_EXPIRED' &&
        options.authenticated &&
        options.retryAfterRefresh !== false &&
        this.refreshToken
      ) {
        await this.refresh();
        return this.request<T>(path, { ...options, retryAfterRefresh: false });
      }

      if (error.code === 'ACCOUNT_DISABLED') {
        await this.clearSession();
        notifySessionInvalidated('ACCOUNT_DISABLED');
      }

      throw new BackendApiError(error.code, error.message, response.status, error.details);
    }

    if (!payload || !('data' in payload)) {
      throw new BackendApiError('INTERNAL_ERROR', 'The wallet backend returned an invalid response.', 500);
    }
    return payload.data;
  }

  register(input: RegistrationInput) {
    return this.request<RegistrationResult>('/auth/register', { method: 'POST', body: input });
  }

  async resendConfirmation(email: string) {
    await this.request<null>('/auth/resend-confirmation', { method: 'POST', body: { email } });
  }

  async login(input: LoginInput) {
    const session = await this.request<AuthSession>('/auth/login', { method: 'POST', body: input });
    await this.setSession(session);
    return session;
  }

  async refresh() {
    await this.loadSession();
    if (!this.refreshToken) {
      await this.clearSession();
      notifySessionInvalidated('REFRESH_TOKEN_INVALID_OR_EXPIRED');
      throw new BackendApiError('REFRESH_TOKEN_INVALID_OR_EXPIRED', 'Please log in again.', 401);
    }
    try {
      const session = await this.request<AuthSession>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: this.refreshToken },
        retryAfterRefresh: false,
      });
      await this.setSession(session);
      return session;
    } catch (error) {
      await this.clearSession();
      notifySessionInvalidated(
        error instanceof BackendApiError && error.code === 'ACCOUNT_DISABLED'
          ? 'ACCOUNT_DISABLED'
          : 'REFRESH_TOKEN_INVALID_OR_EXPIRED',
      );
      throw error;
    }
  }

  async logout() {
    await this.loadSession();
    try {
      if (this.accessToken) {
        await this.request<null>('/auth/logout', {
          method: 'POST',
          authenticated: true,
          retryAfterRefresh: false,
        });
      }
    } finally {
      await this.clearSession();
    }
  }

  async getAuthMe(): Promise<AuthMe> {
    const response = await this.request<AuthMeResponse>('/auth/me', { authenticated: true });
    return {
      authUserId: response.supabaseAuthId,
      holderAccountId: response.holderAccountId,
      email: response.email,
      role: response.role,
      accountStatus: response.accountStatus,
      firstName: response.firstName,
      lastName: response.lastName,
    };
  }

  getHolderAccount() {
    return this.request<HolderAccount>('/holder-accounts/me', { authenticated: true });
  }

  getIssuerProviders() {
    return this.request<IssuerProvider[]>('/issuer-providers', { authenticated: true });
  }

  submitOnboarding(input: OnboardingSubmission) {
    if (input.nationality === 'thai') {
      throw new BackendApiError(
        'THAI_NATIONAL_ID_MOCK_ONLY',
        'Thai national ID verification is available only in the mock trusted-service flow.',
        400,
      );
    }
    if (!input.passportNumber) {
      throw new BackendApiError('PASSPORT_REQUIRED', 'Passport number is required for foreigner verification.', 400);
    }
    return this.request<OnboardingRequest>('/onboarding-verification/requests', {
      method: 'POST',
      authenticated: true,
      body: {
        admissionNo: input.admissionNo,
        dateOfBirth: input.dateOfBirth,
        passportNumber: input.passportNumber,
      },
    });
  }

  async getMyOnboardingRequest() {
    try {
      return await this.request<OnboardingRequest>('/onboarding-verification/requests/me', {
        authenticated: true,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.code === 'NOT_FOUND') return null;
      throw error;
    }
  }
}
