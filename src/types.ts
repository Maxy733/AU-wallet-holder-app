export type Screen =
  | 'loading'
  | 'welcome'
  | 'registration'
  | 'check_email'
  | 'login'
  | 'forgot_password'
  | 'reset_password'
  | 'identity_submission'
  | 'onboarding_status'
  | 'unlock_pin'
  | 'create_pin' // NEW: Setup 6-digit passcode
  | 'verifying' // NEW: Loading spinner status panel
  | 'wallet'
  | 'camera'
  | 'trusted_services'
  | 'offer'
  | 'success'
  | 'credential'
  | 'revoked_vc'
  | 'contact_support'
  | 'share'
  | 'verification'
  | 'receipt'
  | 'history'
  | 'notifications'
  | 'settings'
  | 'edit_profile'
  | 'linked_issuer';

export type ShareFields = {
  degree: boolean;
  major: boolean;
  graduation: boolean;
  gpa: boolean;
};

export type HistoryEvent = {
  id: string;
  occurredAt: string;
  type: 'share' | 'issue' | 'offer' | 'revoke';
  title: string;
  subtitle: string;
  targetScreen: Screen;
  sharedFields?: ShareFields;
  fromCamera?: boolean;
};
