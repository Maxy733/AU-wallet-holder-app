import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthMe,
  BackendApiError,
  CredentialOffer,
  HolderAccount,
  IssuerProvider,
  isSessionError,
  OnboardingRequest,
  sessionErrorMessage,
  setSessionInvalidatedHandler,
  walletApi,
} from './src/api';
import { BottomNav, PrimaryButton } from './src/components';
import { loadIssuedCredential, saveIssuedCredential } from './src/lib/credentialStore';
import { createCredentialOfferProof } from './src/lib/holderProof';
import { loadProfilePreferences, ProfilePreferences, saveProfilePreferences } from './src/lib/profilePreferences';
import { hasWalletPin, saveWalletPin } from './src/lib/walletSecurity';
import { CheckEmailScreen } from './src/screens/CheckEmailScreen';
import CreatePinScreen from './src/screens/CreatePinScreen';
import { CredentialScreen } from './src/screens/CredentialScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { IdentitySubmissionScreen } from './src/screens/IdentitySubmissionScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { LinkedIssuerScreen } from './src/screens/LinkedIssuerScreen';
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
  const [profilePreferences, setProfilePreferences] = useState<ProfilePreferences>({ nickname: '', photoUri: null });
  const [currentUser, setCurrentUser] = useState<AuthMe | null>(null);
  const [onboardingRequest, setOnboardingRequest] = useState<OnboardingRequest | null>(null);
  const [pinPurpose, setPinPurpose] = useState<'wallet' | 'share'>('wallet');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [loginNotice, setLoginNotice] = useState<string | null>(null);
  const [holderAccount, setHolderAccount] = useState<HolderAccount | null>(null);
  const [issuerProviders, setIssuerProviders] = useState<IssuerProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [credentialOffers, setCredentialOffers] = useState<CredentialOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [offerAcceptanceError, setOfferAcceptanceError] = useState<string | null>(null);
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

  const loadCredentialOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError(null);
    try {
      const [offers, storedCredential] = await Promise.all([
        walletApi.getMyCredentialOffers(),
        currentUser ? loadIssuedCredential(currentUser.authUserId) : Promise.resolve(null),
      ]);
      setCredentialOffers(offers);
      setHasCredential(offers.some((offer) => offer.status === 'issued') || Boolean(storedCredential));
    } catch (error) {
      if (isSessionError(error)) throw error;
      setCredentialOffers([]);
      setOffersError('Could not load credential offers. Check the connection and try again.');
    } finally {
      setOffersLoading(false);
    }
  }, [currentUser]);

  const loadHolderState = useCallback(async () => {
    setScreen('loading');
    setSetupError(null);
    try {
      const me = await walletApi.getAuthMe();
      const [holder, savedProfilePreferences] = await Promise.all([
        walletApi.getHolderAccount(),
        loadProfilePreferences(me.authUserId).catch(() => ({ nickname: '', photoUri: null })),
      ]);
      if (me.role !== 'student' || !me.holderAccountId) {
        throw new BackendApiError('FORBIDDEN', 'This account cannot use the holder wallet.', 403);
      }

      setCurrentUser(me);
      setHolderAccount(holder);
      setProfilePreferences(savedProfilePreferences);
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
        setCredentialOffers([]);
        setOffersError(null);
        setOfferAcceptanceError(null);
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
      setCredentialOffers([]);
      setOffersError(null);
      setOfferAcceptanceError(null);
      setHasCredential(false);
      setProfilePreferences({ nickname: '', photoUri: null });
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
      setCredentialOffers([]);
      setOffersError(null);
      setOfferAcceptanceError(null);
      setHasCredential(false);
      setProfilePreferences({ nickname: '', photoUri: null });
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

  const walletEnabled = holderAccount?.accountStatus === 'active' && Boolean(holderAccount.confirmedAt);
  const pendingOffer = credentialOffers.find((offer) => offer.status === 'pending') ?? null;
  const registeredName = [holderAccount?.firstName?.trim(), holderAccount?.lastName?.trim()].filter(Boolean).join(' ') || 'Wallet holder';
  const displayName = profilePreferences.nickname || registeredName;
  const studentId = holderAccount?.studentId?.trim() || 'Pending verification';
  const showNav = walletEnabled && ['wallet', 'history', 'settings', 'success'].includes(screen);

  useEffect(() => {
    if (!walletEnabled || !['wallet', 'success'].includes(screen)) return;
    void loadCredentialOffers().catch((error) => {
      if (!isSessionError(error)) return;
      setLoginNotice(sessionErrorMessage(error instanceof BackendApiError ? error.code : 'AUTHENTICATION_REQUIRED'));
      setScreen('login');
    });
  }, [loadCredentialOffers, screen, walletEnabled]);

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

  const retryCredentialOffers = useCallback(() => {
    void loadCredentialOffers().catch((error) => {
      if (!isSessionError(error)) return;
      setCurrentUser(null);
      setCredentialOffers([]);
      setLoginNotice(sessionErrorMessage(error instanceof BackendApiError ? error.code : 'AUTHENTICATION_REQUIRED'));
      setScreen('login');
    });
  }, [loadCredentialOffers]);

  const acceptPendingOffer = useCallback(async () => {
    if (!pendingOffer || !currentUser) return;
    setOfferAcceptanceError(null);
    setScreen('verifying');
    try {
      const jwt = await createCredentialOfferProof({
        userId: currentUser.authUserId,
        credentialIssuer: pendingOffer.credentialIssuer,
        nonce: pendingOffer.nonce,
      });
      const issued = await walletApi.acceptCredentialOffer(pendingOffer.offerId, {
        proof_type: 'jwt',
        jwt,
      });
      await saveIssuedCredential(currentUser.authUserId, issued);
      setCredentialOffers((offers) => offers.map((offer) =>
        offer.offerId === issued.offerId ? { ...offer, status: 'issued' } : offer,
      ));
      setHasCredential(true);
      setHistory((events) => [{
        id: issued.credentialId,
        type: 'issue',
        title: `Issued: ${pendingOffer.displayName}`,
        subtitle: `From ${pendingOffer.issuerName}`,
        targetScreen: 'credential',
      }, ...events]);
      await loadCredentialOffers();
      setScreen('success');
    } catch (error) {
      setOfferAcceptanceError(
        error instanceof BackendApiError ? error.message : 'The credential offer could not be accepted.',
      );
      setScreen('offer');
    }
  }, [currentUser, loadCredentialOffers, pendingOffer]);

  const acceptOnboardingRequest = useCallback((request: OnboardingRequest) => {
    setOnboardingRequest(request);
    setScreen('onboarding_status');
    retryIssuerProviders();
  }, [retryIssuerProviders]);

  const goWithShareProtection = useCallback((nextScreen: Screen) => {
    if (nextScreen === 'share') {
      setPinPurpose('share');
      setScreen('unlock_pin');
      return;
    }
    setScreen(nextScreen);
  }, []);

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
            onRegistered={({ email }) => {
              setAuthEmail(email);
              setScreen('check_email');
            }}
          />
        );
      case 'check_email':
        return <CheckEmailScreen email={authEmail} onReturnToLogin={() => setScreen('login')} />;
      case 'login':
        return <LoginScreen initialEmail={authEmail} initialError={loginNotice} onBack={() => { setLoginNotice(null); setScreen('welcome'); }} onLoggedIn={() => { setLoginNotice(null); void loadHolderState(); }} onRegister={() => setScreen('registration')} />;
      case 'identity_submission':
        return <IdentitySubmissionScreen onSubmitted={acceptOnboardingRequest} onBack={() => setScreen('wallet')} />;
      case 'onboarding_status':
        if (!onboardingRequest) return <IdentitySubmissionScreen onSubmitted={acceptOnboardingRequest} onBack={() => setScreen('wallet')} />;
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
            go={goWithShareProtection}
            hasCredential={hasCredential}
            pendingOffer={pendingOffer}
            offersLoading={offersLoading}
            offersError={offersError}
            walletEnabled={walletEnabled}
            issuerProviders={issuerProviders}
            providersLoading={providersLoading}
            providersError={providersError}
            onRetryProviders={retryIssuerProviders}
            onRetryOffers={retryCredentialOffers}
            onSelectIssuer={selectIssuerProvider}
            onSignOut={() => void signOut()}
            holderName={displayName}
            profilePhotoUri={profilePreferences.photoUri}
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
        if (!pendingOffer) return null;
        return (
          <OfferScreen
            go={setScreen}
            offer={pendingOffer}
            errorMessage={offerAcceptanceError}
            onAccept={() => void acceptPendingOffer()}
          />
        );
      case 'verifying':
        return <VerifyingScreen />;
      case 'success':
        return (
          <WalletScreen
            go={goWithShareProtection}
            hasCredential={hasCredential}
            pendingOffer={pendingOffer}
            offersLoading={offersLoading}
            offersError={offersError}
            walletEnabled={walletEnabled}
            issuerProviders={issuerProviders}
            providersLoading={providersLoading}
            providersError={providersError}
            onRetryProviders={retryIssuerProviders}
            onRetryOffers={retryCredentialOffers}
            onSelectIssuer={selectIssuerProvider}
            onSignOut={() => void signOut()}
            holderName={displayName}
            profilePhotoUri={profilePreferences.photoUri}
          />
        );
      case 'credential':
        return <CredentialScreen go={goWithShareProtection} holderName={registeredName} studentId={studentId} />;
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
        return (
          <SettingsScreen
            go={setScreen}
            onSignOut={() => void signOut()}
            displayName={displayName}
            studentId={studentId}
            profilePhotoUri={profilePreferences.photoUri}
          />
        );
      case 'edit_profile':
        if (!currentUser) return <WelcomeScreen onRegister={() => setScreen('registration')} onLogin={() => setScreen('login')} />;
        return (
          <EditProfileScreen
            officialName={registeredName}
            initialNickname={profilePreferences.nickname}
            initialPhotoUri={profilePreferences.photoUri}
            onBack={() => setScreen('settings')}
            onSave={async (draft) => {
              const savedPreferences = await saveProfilePreferences(currentUser.authUserId, draft);
              setProfilePreferences(savedPreferences);
              setScreen('settings');
            }}
          />
        );
      case 'linked_issuer':
        return (
          <LinkedIssuerScreen
            officialName={registeredName}
            studentId={studentId}
            confirmedAt={holderAccount?.confirmedAt ?? null}
            onBack={() => setScreen('settings')}
          />
        );
      default:
        return <WelcomeScreen onRegister={() => setScreen('registration')} onLogin={() => setScreen('login')} />;
    }
  }, [acceptOnboardingRequest, acceptPendingOffer, authEmail, continueAfterMatch, currentUser, displayName, goWithShareProtection, hasCredential, history, holderAccount, issuerProviders, loadHolderState, loginNotice, offerAcceptanceError, offersError, offersLoading, onboardingRequest, pendingOffer, pinPurpose, profilePreferences, providersError, providersLoading, refreshOnboarding, registeredName, retryCredentialOffers, retryIssuerProviders, screen, selectIssuerProvider, setupError, shareFields, signOut, studentId, walletEnabled]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.appShell}
        edges={showNav ? ['top', 'right', 'left'] : ['top', 'right', 'bottom', 'left']}
      >
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
