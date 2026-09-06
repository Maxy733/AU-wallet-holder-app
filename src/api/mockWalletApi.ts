import * as Crypto from 'expo-crypto';

import { BackendApiError } from './httpWalletApi';
import { clearApiSession, readApiSession, saveApiSession } from './secureSession';
import type {
  AuthMe,
  AuthSession,
  CredentialOffer,
  CredentialOfferProof,
  HolderAccount,
  IssuerProvider,
  IssuedCredential,
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
  private firstName = '';
  private lastName = '';
  private submittedStudentId = '';
  private authenticated = false;
  private sessionLoaded = false;
  private accountStatus: 'pending' | 'active' = 'pending';
  private onboarding: OnboardingRequest | null = null;
  private credentialOffers: CredentialOffer[] = [];

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
    this.firstName = input.firstName.trim();
    this.lastName = input.lastName.trim();
    this.submittedStudentId = '';
    this.authenticated = false;
    this.sessionLoaded = true;
    this.accountStatus = 'pending';
    this.onboarding = null;
    this.credentialOffers = [];
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
      firstName: this.firstName,
      lastName: this.lastName,
      studentId: this.accountStatus === 'active' ? this.submittedStudentId || null : null,
      universityEmail: null,
      personalEmail: this.email,
      accountStatus: this.accountStatus,
      confirmedAt: this.accountStatus === 'active' ? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  async getIssuerProviders(): Promise<IssuerProvider[]> {
    await wait();
    await this.requireAuthentication();
    const connectionStatus = this.onboarding?.verificationStatus === 'under_review'
      ? 'pending_verification'
      : this.onboarding?.verificationStatus === 'matched'
        ? 'verified'
        : this.onboarding?.verificationStatus === 'rejected'
          ? 'rejected'
          : null;

    return [
      {
        issuerCode: 'assumption-university',
        displayName: 'Assumption University',
        description: 'Connect to verify your Assumption University student status.',
        availability: 'available',
        connectionEnabled: true,
        isMock: true,
        connectionStatus,
      },
      {
        issuerCode: 'thaid',
        displayName: 'ThaID (Thai Digital Identity)',
        description: 'Prototype placeholder for a planned ThaID integration.',
        availability: 'coming_soon',
        connectionEnabled: false,
        isMock: true,
        connectionStatus: null,
      },
      {
        issuerCode: 'dlt-qr-licence',
        displayName: 'DLT QR Licence',
        description: 'Prototype placeholder for a planned DLT QR Licence integration.',
        availability: 'coming_soon',
        connectionEnabled: false,
        isMock: true,
        connectionStatus: null,
      },
    ];
  }

  async getMyCredentialOffers(): Promise<CredentialOffer[]> {
    await wait();
    await this.requireAuthentication();
    return this.credentialOffers.map((offer) => ({
      ...offer,
      preview: { ...offer.preview },
    }));
  }

  async acceptCredentialOffer(offerId: string, _proof: CredentialOfferProof): Promise<IssuedCredential> {
    await wait();
    await this.requireAuthentication();
    const offer = this.credentialOffers.find((candidate) => candidate.offerId === offerId);
    if (!offer || offer.status !== 'pending') {
      throw new BackendApiError('CREDENTIAL_OFFER_NOT_FOUND', 'This credential offer is no longer pending.', 404);
    }
    const issued: IssuedCredential = {
      credential: `mock-dc+sd-jwt.${Crypto.randomUUID()}`,
      format: 'dc+sd-jwt',
      offerId: offer.offerId,
      status: 'issued',
      credentialId: `mock-vc-${Date.now()}`,
      issuedAt: now(),
    };
    this.credentialOffers = this.credentialOffers.map((candidate) =>
      candidate.offerId === offerId ? { ...candidate, status: 'issued' } : candidate,
    );
    return issued;
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
    this.submittedStudentId = input.admissionNo.trim();
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
