export type AccountStatus = 'pending' | 'active' | 'rejected' | 'suspended';
export type VerificationStatus = 'under_review' | 'matched' | 'rejected';
export type IssuerAvailability = 'available' | 'coming_soon';
export type IssuerConnectionStatus =
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'disconnected'
  | null;

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  personalEmail: string;
  password: string;
};

export type RegistrationResult = {
  authUserId: string;
  holderAccountId: number;
  email: string;
  role: 'student';
  accountStatus: AccountStatus;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  authUserId: string;
  holderAccountId: number | null;
  email: string;
  role: 'student' | 'issuer_staff' | 'admin';
  accountStatus: AccountStatus | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
};

export type AuthMe = {
  authUserId: string;
  holderAccountId: number | null;
  email: string;
  role: AuthUser['role'];
  accountStatus: AccountStatus | null;
};

export type AuthMeResponse = Omit<AuthMe, 'authUserId'> & {
  supabaseAuthId: string;
};

export type HolderAccount = {
  holderAccountId: number;
  authUserId: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  universityEmail: string | null;
  personalEmail: string;
  accountStatus: AccountStatus;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicantNationality = 'thai' | 'foreigner';

export type OnboardingSubmission = {
  admissionNo: string;
  dateOfBirth: string;
  nationality: ApplicantNationality;
  passportNumber?: string;
  thaiNationalId?: string;
};

export type OnboardingRequest = {
  onboardingRequestId: number;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  submittedAt: string;
};

export type IssuerProvider = {
  issuerCode: string;
  displayName: string;
  description: string;
  availability: IssuerAvailability;
  connectionEnabled: boolean;
  isMock: boolean;
  connectionStatus: IssuerConnectionStatus;
};

export type CredentialOfferStatus = 'pending' | 'accepted' | 'declined';

export type AcademicTranscriptPreview = {
  degree: string;
  major: string;
  graduationDate: string;
  gpa: string | number;
};

export type CredentialOffer = {
  offerId: string;
  credentialType: 'academic_transcript';
  displayName: string;
  issuerName: string;
  issuerDid: string;
  studentNumber: string;
  holderName: string;
  status: CredentialOfferStatus;
  createdAt: string;
  preview: AcademicTranscriptPreview;
};

export type AcceptedCredentialOffer = CredentialOffer & {
  status: 'accepted';
  credentialId: string;
  acceptedAt: string;
};

export type ApiSuccess<T> = {
  data: T;
  message: string;
  meta: Record<string, unknown>;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
};

export interface WalletBackendApi {
  hasStoredSession(): Promise<boolean>;
  register(input: RegistrationInput): Promise<RegistrationResult>;
  resendConfirmation(email: string): Promise<void>;
  login(input: LoginInput): Promise<AuthSession>;
  refresh(): Promise<AuthSession>;
  logout(): Promise<void>;
  getAuthMe(): Promise<AuthMe>;
  getHolderAccount(): Promise<HolderAccount>;
  getIssuerProviders(): Promise<IssuerProvider[]>;
  getMyCredentialOffers(): Promise<CredentialOffer[]>;
  acceptCredentialOffer(offerId: string): Promise<AcceptedCredentialOffer>;
  submitOnboarding(input: OnboardingSubmission): Promise<OnboardingRequest>;
  getMyOnboardingRequest(): Promise<OnboardingRequest | null>;
}
