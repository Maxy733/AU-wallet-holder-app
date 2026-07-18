export type Screen =
  | 'welcome'
  | 'identity_auth' // NEW: Enter student ID & university email
  | 'create_pin' // NEW: Setup 6-digit passcode
  | 'identity_proofing' // NEW: Input Passport, National ID, Grad Date
  | 'issue' // NEW: Issue credential flow
  | 'login' // NEW: Authenticate after issue
  | 'verifying' // NEW: Loading spinner status panel
  | 'wallet'
  | 'offer'
  | 'success'
  | 'credential'
  | 'share'
  | 'verification'
  | 'receipt'
  | 'history'
  | 'settings'

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
