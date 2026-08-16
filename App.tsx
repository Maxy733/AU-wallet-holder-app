import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthMe,
  BackendApiError,
  HolderAccount,
  IssuerProvider,
  isSessionError,
  OnboardingRequest,
  sessionErrorMessage,
  setSessionInvalidatedHandler,
  walletApi,
} from './src/api';
import { BottomNav, PrimaryButton } from './src/components';
import { hasWalletPin, saveWalletPin } from './src/lib/walletSecurity';
import { CheckEmailScreen } from './src/screens/CheckEmailScreen';
import CreatePinScreen from './src/screens/CreatePinScreen';
import { CredentialScreen } from './src/screens/CredentialScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { IdentitySubmissionScreen } from './src/screens/IdentitySubmissionScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OfferScreen } from './src/screens/OfferScreen';
import { OnboardingStatusScreen } from './src/screens/OnboardingStatusScreen';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import { RegistrationScreen } from './src/screens/RegistrationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ShareScreen } from './src/screens/ShareScreen';
import { TrustedServicesScreen } from './src/screens/TrustedServicesScreen';
import { UnlockPinScreen } from './src/screens/UnlockPinScreen';
import { VerificationScreen } from './src/screens/VerificationScreen';
import { VerifyingScreen } from './src/screens/VerifyingScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors } from './src/theme/constants';
import { styles } from './src/theme/styles';
import type { HistoryEvent, Screen } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [authEmail, setAuthEmail] = useState('');
  const [holderProfile, setHolderProfile] = useState({ firstName: '', lastName: '', studentId: '' });
  const [currentUser, setCurrentUser] = useState<AuthMe | null>(null);
  const [onboardingRequest, setOnboardingRequest] = useState<OnboardingRequest | null>(null);
  const [pinPurpose, setPinPurpose] = useState<'wallet' | 'share'>('wallet');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [holderAccount, setHolderAccount] = useState<HolderAccount | null>(null);
  const [issuerProviders, setIssuerProviders] = useState<IssuerProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [hasCredential, setHasCredential] = useState(false);
  const [shareFields, setShareFields] = useState({
    degree: true,
    major: true,
    graduation: true,
    gpa: false,
    standing: false,
  });
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const loadIssuerProviders = useCallback(async () => {
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      setIssuerProviders(await walletApi.getIssuerProviders());
    } catch (error) {
      if (isSessionError(error)) throw error;
      setIssuerProviders([]);
      setProvidersError('Could not load issuer providers. Check the connection and try again.');
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  const loadHolderState = useCallback(async () => {
    setScreen('loading');
    setSetupError(null);
    try {
      const me = await walletApi.getAuthMe();
      const holder = await walletApi.getHolderAccount();
      if (me.role !== 'student' || !me.holderAccountId) {
        throw new BackendApiError('FORBIDDEN', 'This account cannot use the holder wallet.', 403);
      }

      setCurrentUser(me);
      setHolderAccount(holder);
      const request = await walletApi.getMyOnboardingRequest();
      setOnboardingRequest(request);
      await loadIssuerProviders();
      if (request?.verificationStatus === 'matched' && holder.accountStatus === 'active' && holder.confirmedAt) {
        const pinExists = await hasWalletPin(me.authUserId);
        setPinPurpose('wallet');
        setScreen(pinExists ? 'unlock_pin' : 'create_pin');
      } else {
        setScreen('wallet');
      }
    } catch (error) {
      if (isSessionError(error)) {
        setCurrentUser(null);
        setOnboardingRequest(null);
        setHolderAccount(null);
        setIssuerProviders([]);
        setProvidersError(null);
        setLoginNotice(sessionErrorMessage(error instanceof BackendApiError ? error.code : 'AUTHENTICATION_REQUIRED'));
        setScreen('login');
        return;
      }
      setSetupError(error instanceof BackendApiError ? error.message : 'Could not load the holder account.');
      setScreen('loading');
    }
  }, [loadIssuerProviders]);

  const refreshOnboarding = useCallback(async () => {
    const holder = await walletApi.getHolderAccount();
    const request = await walletApi.getMyOnboardingRequest();
    setHolderAccount(holder);
    setOnboardingRequest(request);
    await loadIssuerProviders();
    setScreen(request ? 'onboarding_status' : 'identity_submission');
  }, [loadIssuerProviders]);

  const continueAfterMatch = useCallback(async () => {
    if (!currentUser || onboardingRequest?.verificationStatus !== 'matched') return;
    setScreen('loading');
    setSetupError(null);
    try {
      const holder = await walletApi.getHolderAccount();
      setHolderAccount(holder);
      if (holder.accountStatus !== 'active' || !holder.confirmedAt) {
        throw new BackendApiError(
          'HOLDER_NOT_ACTIVE',
          'Issuer approval is recorded, but the holder account is not active yet. Refresh and try again.',
          409,
        );
      }
      const pinExists = await hasWalletPin(currentUser.authUserId);
      setPinPurpose('wallet');
      setScreen(pinExists ? 'unlock_pin' : 'create_pin');
    } catch (error) {
      if (isSessionError(error)) {
        setLoginNotice(sessionErrorMessage(error instanceof BackendApiError ? error.code : 'AUTHENTICATION_REQUIRED'));
        setScreen('login');
        return;
      }
      setSetupError(error instanceof BackendApiError ? error.message : 'Could not confirm that the holder account is active.');
      setScreen('loading');
    }
  }, [currentUser, onboardingRequest]);

  const signOut = useCallback(async () => {
    setSetupError(null);
    try {
      await walletApi.logout();
    } catch (error) {
      setSetupError(error instanceof BackendApiError ? error.message : 'Logout could not be confirmed by the backend.');
    } finally {
      setCurrentUser(null);
      setOnboardingRequest(null);
      setHolderAccount(null);
      setIssuerProviders([]);
      setProvidersError(null);
      setHasCredential(false);
      setHolderProfile({ firstName: '', lastName: '', studentId: '' });
      setHistory([]);
      setScreen('welcome');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const removeInvalidationHandler = setSessionInvalidatedHandler((reason) => {
      if (!active) return;
      setCurrentUser(null);
      setOnboardingRequest(null);
      setHolderAccount(null);
      setIssuerProviders([]);
      setProvidersError(null);
      setHasCredential(false);
      setHolderProfile({ firstName: '', lastName: '', studentId: '' });
      setHistory([]);
      setLoginNotice(sessionErrorMessage(reason));
      setScreen('login');
    });

    void walletApi.hasStoredSession()
      .then((hasSession) => {
        if (!active) return;
        if (hasSession) void loadHolderState();
        else setScreen('welcome');
      })
      .catch(() => {
        if (!active) return;
        setSetupError('The secure session could not be read. Return to start and log in again.');
        setScreen('loading');
      });

    return () => {
      active = false;
      removeInvalidationHandler();
    };
  }, [loadHolderState]);

  useEffect(() => {
    if (screen !== 'verifying') return;

    const verificationTimer = setTimeout(() => {
      setHasCredential(true);
      setHistory([{
        id: 'initial-issue',
        type: 'issue',
        title: 'Issued: Education Transcript VC',
        subtitle: 'From AU Registrar',
        targetScreen: 'credential',
      }]);
      setScreen('success');
    }, 2500);

    return () => clearTimeout(verificationTimer);
  }, [screen]);

  const walletEnabled = holderAccount?.accountStatus === 'active' && Boolean(holderAccount.confirmedAt);
  const holderName = [holderProfile.firstName, holderProfile.lastName].filter(Boolean).join(' ') || 'Wallet holder';
  const studentId = holderProfile.studentId || 'Pending verification';
  const showNav = walletEnabled && ['wallet', 'history', 'settings', 'success'].includes(screen);

  const openAssumptionConnection = useCallback(() => {
    setScreen(onboardingRequest ? 'onboarding_status' : 'identity_submission');
  }, [onboardingRequest]);

  const selectIssuerProvider = useCallback((provider: IssuerProvider) => {
    if (
      provider.issuerCode === 'assumption-university' &&
      provider.availability === 'available' &&
      provider.connectionEnabled
    ) {
      openAssumptionConnection();
    }
  }, [openAssumptionConnection]);

  const retryIssuerProviders = useCallback(() => {
    void loadIssuerProviders().catch((error) => {
      if (!isSessionError(error)) return;
      setCurrentUser(null);
      setOnboardingRequest(null);
      setHolderAccount(null);
      setIssuerProviders([]);
      setLoginNotice(sessionErrorMessage(error instanceof BackendApiError ? error.code : 'AUTHENTICATION_REQUIRED'));
      setScreen('login');
    });
  }, [loadIssuerProviders]);

  const goFromWallet = (nextScreen: Screen) => {
    if (nextScreen === 'share') {
      setPinPurpose('share');
      setScreen('unlock_pin');
      return;
    }
    setScreen(nextScreen);
  };

  const content = useMemo(() => {
    if (screen === 'loading') {
      return (
        <View style={localStyles.loadingScreen}>
          {setupError ? (
            <>
              <Text style={localStyles.errorTitle}>Could not continue</Text>
              <Text style={localStyles.errorBody}>{setupError}</Text>
              <PrimaryButton label="Try again" onPress={() => void loadHolderState()} />
              <Pressable onPress={() => void signOut()}><Text style={localStyles.signOutText}>Return to start</Text></Pressable>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={colors.red} />
              <Text style={localStyles.loadingText}>Loading holder account...</Text>
            </>
          )}
        </View>
      );
    }

    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onRegister={() => setScreen('registration')} onLogin={() => setScreen('login')} />;
      case 'registration':
        return (
          <RegistrationScreen
            onBack={() => setScreen('welcome')}
            onReturnToLogin={(email) => {
              setAuthEmail(email);
              setScreen('login');
            }}
            onRegistered={({ email, firstName, lastName }) => {
              setAuthEmail(email);
              setHolderProfile({ firstName, lastName, studentId: '' });
              setScreen('check_email');
            }}
          />
        );
      case 'check_email':
        return <CheckEmailScreen email={authEmail} onReturnToLogin={() => setScreen('login')} />;
      case 'login':
        return <LoginScreen initialEmail={authEmail} initialError={loginNotice} onBack={() => { setLoginNotice(null); setScreen('welcome'); }} onLoggedIn={() => { setLoginNotice(null); void loadHolderState(); }} onRegister={() => setScreen('registration')} />;
      case 'identity_submission':
        return <IdentitySubmissionScreen onSubmitted={(request, submittedStudentId) => { setHolderProfile((profile) => ({ ...profile, studentId: submittedStudentId })); setOnboardingRequest(request); setScreen('onboarding_status'); retryIssuerProviders(); }} onBack={() => setScreen('wallet')} />;
      case 'onboarding_status':
        if (!onboardingRequest) return <IdentitySubmissionScreen onSubmitted={(request, submittedStudentId) => { setHolderProfile((profile) => ({ ...profile, studentId: submittedStudentId })); setOnboardingRequest(request); setScreen('onboarding_status'); retryIssuerProviders(); }} onBack={() => setScreen('wallet')} />;
        return (
          <OnboardingStatusScreen
            request={onboardingRequest}
            holderAccount={holderAccount}
            onRequestChange={setOnboardingRequest}
            onRefresh={refreshOnboarding}
            onContinue={() => void continueAfterMatch()}
            onCorrect={() => setScreen('identity_submission')}
            onBackToWallet={() => setScreen('wallet')}
          />
        );
      case 'create_pin':
        return (
          <CreatePinScreen
            onComplete={async (pin) => {
              if (
                !currentUser ||
                onboardingRequest?.verificationStatus !== 'matched' ||
                holderAccount?.accountStatus !== 'active' ||
                !holderAccount.confirmedAt
              ) {
                throw new Error('Issuer approval is required before wallet PIN setup.');
              }
              await saveWalletPin(currentUser.authUserId, pin);
              setScreen('wallet');
            }}
          />
        );
      case 'unlock_pin':
        if (!currentUser) return <WelcomeScreen onRegister={() => setScreen('registration')} onLogin={() => setScreen('login')} />;
        return (
          <UnlockPinScreen
            userId={currentUser.authUserId}
            purpose={pinPurpose}
            onUnlocked={() => setScreen(pinPurpose === 'share' ? 'share' : 'wallet')}
            onSignOut={() => void signOut()}
          />
        );
      case 'wallet':
        return (
          <WalletScreen
            go={goFromWallet}
            hasCredential={hasCredential}
            walletEnabled={walletEnabled}
            issuerProviders={issuerProviders}
            providersLoading={providersLoading}
            providersError={providersError}
            onRetryProviders={retryIssuerProviders}
            onSelectIssuer={selectIssuerProvider}
            onSignOut={() => void signOut()}
            holderName={holderName}
          />
        );
      case 'trusted_services':
        return (
          <TrustedServicesScreen
            providers={issuerProviders}
            loading={providersLoading}
            errorMessage={providersError}
            onRetry={retryIssuerProviders}
            onSelectIssuer={selectIssuerProvider}
            onBack={() => setScreen('wallet')}
          />
        );
      case 'offer':
        return <OfferScreen go={setScreen} holderName={holderName} />;
      case 'verifying':
        return <VerifyingScreen go={setScreen} />;
      case 'success':
        return (
          <WalletScreen
            go={goFromWallet}
            hasCredential={hasCredential}
            walletEnabled={walletEnabled}
            issuerProviders={issuerProviders}
            providersLoading={providersLoading}
            providersError={providersError}
            onRetryProviders={retryIssuerProviders}
            onSelectIssuer={selectIssuerProvider}
            onSignOut={() => void signOut()}
            holderName={holderName}
          />
        );
      case 'credential':
        return <CredentialScreen go={setScreen} holderName={holderName} studentId={studentId} />;
      case 'share':
        return (
          <ShareScreen
            fields={shareFields}
            setFields={setShareFields}
            go={setScreen}
            onShare={() => {
              const sharedCount = Object.values(shareFields).filter(Boolean).length;
              const newHistoryEvent: HistoryEvent = {
                id: `share-${Date.now()}`,
                type: 'share',
                title: 'Shared proof with Employer A',
                subtitle: `Education Transcript VC · ${sharedCount} field${sharedCount === 1 ? '' : 's'}`,
                targetScreen: 'receipt',
                sharedFields: { ...shareFields },
              };
              setHistory((previous) => [newHistoryEvent, ...previous]);
              setScreen('verification');
            }}
          />
        );
      case 'verification':
        return <VerificationScreen go={setScreen} />;
      case 'receipt':
        return <ReceiptScreen go={setScreen} />;
      case 'history':
        return <HistoryScreen go={setScreen} history={history} />;
      case 'settings':
        return <SettingsScreen go={setScreen} onSignOut={() => void signOut()} holderName={holderName} studentId={studentId} />;
      default:
        return <WelcomeScreen onRegister={() => setScreen('registration')} onLogin={() => setScreen('login')} />;
    }
  }, [authEmail, continueAfterMatch, currentUser, hasCredential, history, holderAccount, holderName, issuerProviders, loadHolderState, loginNotice, onboardingRequest, pinPurpose, providersError, providersLoading, refreshOnboarding, retryIssuerProviders, screen, selectIssuerProvider, setupError, shareFields, signOut, studentId, walletEnabled]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.appShell}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        {content}
        {showNav ? (
          <BottomNav
            active={screen === 'success' ? 'wallet' : (screen as 'wallet' | 'history' | 'settings')}
            go={setScreen}
          />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const localStyles = StyleSheet.create({
  loadingScreen: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center', gap: 18 },
  loadingText: { color: colors.muted, fontSize: 14 },
  errorTitle: { color: colors.ink, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  errorBody: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  signOutText: { color: colors.red, fontSize: 13, fontWeight: '700', padding: 10 },
});
