import * as Crypto from 'expo-crypto';

import { BackendApiError } from './httpWalletApi';
import { clearApiSession, readApiSession, saveApiSession } from './secureSession';
import type {
  AuthMe,
  AuthSession,
  HolderAccount,
  LoginInput,
  OnboardingRequest,
  OnboardingSubmission,
  RegistrationInput,
  RegistrationResult,
  VerificationStatus,
  WalletBackendApi,
} from './types';

const now = () => new Date().toISOString();
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 350));
const mockAuthIdForEmail = async (email: string) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    email.trim().toLowerCase(),
  );
  return `mock-auth-${digest.slice(0, 16)}`;
};

class MockWalletApi implements WalletBackendApi {
  private email = 'student@example.com';
  private authUserId = 'mock-auth-default';
  private authenticated = false;
  private sessionLoaded = false;
  private accountStatus: 'pending' | 'active' = 'pending';
  private onboarding: OnboardingRequest | null = null;

  private async requireAuthentication() {
    if (!this.sessionLoaded) await this.hasStoredSession();
    if (!this.authenticated) {
      throw new BackendApiError('ACCESS_TOKEN_INVALID_OR_EXPIRED', 'Please log in again.', 401);
    }
  }

  async hasStoredSession() {
    const stored = await readApiSession('mock');
    this.authenticated = Boolean(stored?.accessToken && stored.refreshToken);
    this.sessionLoaded = true;
    return this.authenticated;
  }

  async register(input: RegistrationInput): Promise<RegistrationResult> {
    await wait();
    this.email = input.personalEmail.trim().toLowerCase();
    this.authUserId = await mockAuthIdForEmail(this.email);
    this.authenticated = false;
    this.sessionLoaded = true;
    this.accountStatus = 'pending';
    this.onboarding = null;
    await clearApiSession('mock');
    return {
      authUserId: this.authUserId,
      holderAccountId: 12,
      email: this.email,
      role: 'student',
      accountStatus: 'pending',
    };
  }

  async resendConfirmation() {
    await wait();
  }

  async login(input: LoginInput): Promise<AuthSession> {
    await wait();
    this.email = input.email.trim().toLowerCase();
    this.authUserId = await mockAuthIdForEmail(this.email);
    const session = this.session();
    await this.persistSession(session);
    this.authenticated = true;
    this.sessionLoaded = true;
    return session;
  }

  async refresh() {
    await wait();
    await this.requireAuthentication();
    const session = this.session();
    await this.persistSession(session);
    return session;
  }

  async logout() {
    await wait();
    this.authenticated = false;
    this.sessionLoaded = true;
    await clearApiSession('mock');
  }

  async getAuthMe(): Promise<AuthMe> {
    await wait();
    await this.requireAuthentication();
    return {
      authUserId: this.authUserId,
      holderAccountId: 12,
      email: this.email,
      role: 'student',
      accountStatus: this.accountStatus,
    };
  }

  async getHolderAccount(): Promise<HolderAccount> {
    await wait();
    await this.requireAuthentication();
    const timestamp = now();
    return {
      holderAccountId: 12,
      authUserId: this.authUserId,
      universityEmail: null,
      personalEmail: this.email,
      accountStatus: this.accountStatus,
      confirmedAt: this.accountStatus === 'active' ? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  async submitOnboarding(input: OnboardingSubmission): Promise<OnboardingRequest> {
    await wait();
    await this.requireAuthentication();

    const documentNumber = input.nationality === 'thai' ? input.thaiNationalId : input.passportNumber;
    if (!documentNumber?.trim()) {
      throw new BackendApiError('IDENTITY_DOCUMENT_REQUIRED', 'A verification document number is required.', 400);
    }

    // Do not retain or log the passport or Thai national ID. This mock checks
    // only that a value was supplied and discards it immediately after the call.
    const rejected = input.admissionNo.trim().toUpperCase().startsWith('REJECT');
    this.onboarding = {
      onboardingRequestId: Date.now(),
      verificationStatus: rejected ? 'rejected' : 'under_review',
      rejectionReason: rejected ? 'IDENTITY_INFORMATION_COULD_NOT_BE_CONFIRMED' : null,
      reviewedAt: rejected ? now() : null,
      submittedAt: now(),
    };
    return { ...this.onboarding };
  }

  async getMyOnboardingRequest() {
    await wait();
    await this.requireAuthentication();
    return this.onboarding ? { ...this.onboarding } : null;
  }

  async simulateStatus(status: VerificationStatus) {
    await wait();
    await this.requireAuthentication();
    if (!this.onboarding) {
      throw new BackendApiError('NOT_FOUND', 'Submit verification information first.', 404);
    }
    this.onboarding = {
      ...this.onboarding,
      verificationStatus: status,
      rejectionReason: status === 'rejected' ? 'IDENTITY_INFORMATION_COULD_NOT_BE_CONFIRMED' : null,
      reviewedAt: status === 'under_review' ? null : now(),
    };
    this.accountStatus = status === 'matched' ? 'active' : 'pending';
    return { ...this.onboarding };
  }

  private session(): AuthSession {
    return {
      accessToken: `mock-access-${Crypto.randomUUID()}`,
      refreshToken: `mock-refresh-${Crypto.randomUUID()}`,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      user: {
        authUserId: this.authUserId,
        holderAccountId: 12,
        email: this.email,
        role: 'student',
        accountStatus: this.accountStatus,
      },
    };
  }

  private async persistSession(session: AuthSession) {
    await saveApiSession('mock', {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    });
  }
}

export const mockWalletApi = new MockWalletApi();
