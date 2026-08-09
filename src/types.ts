export type Screen =
  | 'loading'
  | 'welcome'
  | 'registration'
  | 'check_email'
  | 'login'
  | 'identity_submission'
  | 'onboarding_status'
  | 'unlock_pin'
  | 'create_pin' // NEW: Setup 6-digit passcode
  | 'verifying' // NEW: Loading spinner status panel
  | 'wallet'
  | 'trusted_services'
  | 'offer'
  | 'success'
  | 'credential'
  | 'share'
  | 'verification'
  | 'receipt'
  | 'history'
  | 'settings'
;

export type ShareFields = {
  degree: boolean;
  major: boolean;
  graduation: boolean;
  gpa: boolean;
  standing: boolean;
};

export type HistoryEvent = {
  id: string;
  type: 'share' | 'issue';
  title: string;
  subtitle: string;
  targetScreen: Screen;
  sharedFields?: ShareFields;
};
