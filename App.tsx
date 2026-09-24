import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';

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
import type { CredentialValidity } from './src/components/CredentialCard';
import { loadRequireBiometrics, saveRequireBiometrics } from './src/lib/biometricPreferences';
import {
  credentialDisplayFromOffer,
  deleteIssuedCredential,
  type IssuedCredentialDisplay,
  loadIssuedCredential,
  saveIssuedCredential,
} from './src/lib/credentialStore';
import { createCredentialOfferProof } from './src/lib/holderProof';
import { loadReadNotificationIds, saveReadNotificationIds } from './src/lib/offerNotificationStore';
import { loadProfilePreferences, ProfilePreferences, saveProfilePreferences } from './src/lib/profilePreferences';
import { hasWalletPin, saveWalletPin } from './src/lib/walletSecurity';
import { CheckEmailScreen } from './src/screens/CheckEmailScreen';
import { CameraScreen } from './src/screens/CameraScreen';
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
import type { HistoryEvent, Screen, ShareFields } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [authEmail, setAuthEmail] = useState('');
  const [profilePreferences, setProfilePreferences] = useState<ProfilePreferences>({ nickname: '', photoUri: null });
  const [currentUser, setCurrentUser] = useState<AuthMe | null>(null);
  const [onboardingRequest, setOnboardingRequest] = useState<OnboardingRequest | null>(null);
  const [pinPurpose, setPinPurpose] = useState<'wallet' | 'share'>('wallet');
  const [shareOrigin, setShareOrigin] = useState<'credential' | 'camera'>('credential');
  const [receiptFromCamera, setReceiptFromCamera] = useState(false);
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
  const [credentialValidity, setCredentialValidity] = useState<CredentialValidity>('unknown');
  const [issuedCredentialDisplay, setIssuedCredentialDisplay] = useState<IssuedCredentialDisplay | null>(null);
  const [requireBiometrics, setRequireBiometrics] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareFields, setShareFields] = useState({
    degree: true,
    major: true,
    graduation: true,
    gpa: false,
  });
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [hasUnreadActivity, setHasUnreadActivity] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [receiptFields, setReceiptFields] = useState<ShareFields>({
    degree: true,
    major: true,
    graduation: true,
    gpa: false,
  });
  const credentialLoadGeneration = useRef(0);

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
    const generation = ++credentialLoadGeneration.current;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const [offers, storedCredential, savedReadNotificationIds] = await Promise.all([
        walletApi.getMyCredentialOffers(),
        currentUser ? loadIssuedCredential(currentUser.authUserId) : Promise.resolve(null),
        currentUser ? loadReadNotificationIds(currentUser.authUserId).catch(() => []) : Promise.resolve([]),
      ]);
      const matchingOffer = storedCredential
        ? offers.find((offer) => offer.offerId === storedCredential.offerId)
        : null;
      const display = storedCredential?.display ?? (matchingOffer ? credentialDisplayFromOffer(matchingOffer) : null);
      if (generation !== credentialLoadGeneration.current) return;
      setCredentialOffers(offers);
      setReadNotificationIds(savedReadNotificationIds);
      setIssuedCredentialDisplay(display);
      setHasCredential(Boolean(storedCredential));
      setCredentialValidity(
        !storedCredential ? 'unknown'
          : matchingOffer?.status === 'issued' ? 'active'
          : matchingOffer?.status === 'revoked' ? 'invalid'
          : 'unknown',
      );
    } catch (error) {
      if (generation !== credentialLoadGeneration.current) return;
      if (isSessionError(error)) throw error;
      const storedCredential = currentUser
        ? await loadIssuedCredential(currentUser.authUserId).catch(() => null)
        : null;
      if (generation !== credentialLoadGeneration.current) return;
      setCredentialOffers([]);
      setIssuedCredentialDisplay(storedCredential?.display ?? null);
      setHasCredential(Boolean(storedCredential));
      setCredentialValidity('unknown');
      setOffersError('Could not load credential offers. Check the connection and try again.');
    } finally {
      if (generation === credentialLoadGeneration.current) setOffersLoading(false);
    }
  }, [currentUser]);

  const resetWallet = useCallback(async () => {
    if (!currentUser) throw new Error('No holder account is signed in.');
    credentialLoadGeneration.current += 1;
    try {
      await deleteIssuedCredential(currentUser.authUserId);
      setHasCredential(false);
      setIssuedCredentialDisplay(null);
      setCredentialValidity('unknown');
      setHistory((events) => events.filter((event) => event.type !== 'issue'));
      setHasUnreadActivity(false);
    } finally {
      credentialLoadGeneration.current += 1;
      setOffersLoading(false);
    }
  }, [currentUser]);

  const loadHolderState = useCallback(async () => {
    setScreen('loading');
    setSetupError(null);
    try {
      const me = await walletApi.getAuthMe();
      const [holder, savedProfilePreferences, savedRequireBiometrics] = await Promise.all([
        walletApi.getHolderAccount(),
        loadProfilePreferences(me.authUserId).catch(() => ({ nickname: '', photoUri: null })),
        loadRequireBiometrics(me.authUserId),
      ]);
      if (me.role !== 'student' || !me.holderAccountId) {
        throw new BackendApiError('FORBIDDEN', 'This account cannot use the holder wallet.', 403);
      }

      setCurrentUser(me);
      setHolderAccount(holder);
      setProfilePreferences(savedProfilePreferences);
      setRequireBiometrics(savedRequireBiometrics);
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
        setIssuedCredentialDisplay(null);
        setHasCredential(false);
        setCredentialValidity('unknown');
        setOffersError(null);
        setOfferAcceptanceError(null);
        setRequireBiometrics(false);
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
      credentialLoadGeneration.current += 1;
      setCurrentUser(null);
      setOnboardingRequest(null);
      setHolderAccount(null);
      setIssuerProviders([]);
      setProvidersError(null);
      setCredentialOffers([]);
      setIssuedCredentialDisplay(null);
      setOffersError(null);
      setOfferAcceptanceError(null);
      setHasCredential(false);
      setCredentialValidity('unknown');
      setProfilePreferences({ nickname: '', photoUri: null });
      setRequireBiometrics(false);
      setShareError(null);
      setHistory([]);
      setHasUnreadActivity(false);
      setReadNotificationIds([]);
      setScreen('welcome');
    }
  }, []);

  useEffect(() => {
    let active = true;
    const removeInvalidationHandler = setSessionInvalidatedHandler((reason) => {
      if (!active) return;
      credentialLoadGeneration.current += 1;
      setCurrentUser(null);
      setOnboardingRequest(null);
      setHolderAccount(null);
      setIssuerProviders([]);
      setProvidersError(null);
      setCredentialOffers([]);
      setIssuedCredentialDisplay(null);
      setOffersError(null);
      setOfferAcceptanceError(null);
      setHasCredential(false);
      setCredentialValidity('unknown');
      setProfilePreferences({ nickname: '', photoUri: null });
      setRequireBiometrics(false);
      setShareError(null);
      setHistory([]);
      setHasUnreadActivity(false);
      setReadNotificationIds([]);
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
  const latestRevokedOffer = credentialOffers
    .filter((offer) => offer.status === 'revoked')
    .reduce<CredentialOffer | null>((latest, offer) =>
      !latest || Date.parse(offer.createdAt) > Date.parse(latest.createdAt) ? offer : latest,
    null);
  const revocationNotifications: HistoryEvent[] = latestRevokedOffer ? [{
    id: `revoke-${latestRevokedOffer.offerId}`,
    type: 'revoke',
    title: 'Credential revoked',
    subtitle: `${latestRevokedOffer.displayName} from ${latestRevokedOffer.issuerName} is no longer valid`,
    targetScreen: 'wallet',
  }] : [];
  const notificationIds = [
    ...(pendingOffer ? [pendingOffer.offerId] : []),
    ...revocationNotifications.map((event) => event.id),
  ];
  const notificationKey = notificationIds.join(',');
  const hasUnreadNotifications = hasUnreadActivity || notificationIds.some((id) => !readNotificationIds.includes(id));
  const offerNotifications: HistoryEvent[] = pendingOffer ? [{
    id: `offer-${pendingOffer.offerId}`,
    type: 'offer',
    title: 'New credential offer',
    subtitle: `${pendingOffer.displayName} from ${pendingOffer.issuerName} · Tap to review`,
    targetScreen: 'offer',
  }] : [];
  const recentActivity: HistoryEvent[] = [...offerNotifications, ...revocationNotifications, ...history];
  const registeredName = [holderAccount?.firstName?.trim(), holderAccount?.lastName?.trim()].filter(Boolean).join(' ') || 'Wallet holder';
  const displayName = profilePreferences.nickname || registeredName;
  const studentId = holderAccount?.studentId?.trim() || 'Pending verification';
  const showNav = walletEnabled && ['wallet', 'camera', 'history', 'settings', 'success'].includes(screen);

  useEffect(() => {
    if (screen !== 'history') return;
    setHasUnreadActivity(false);
    if (!currentUser) return;
    const unreadIds = notificationIds.filter((id) => !readNotificationIds.includes(id));
    if (unreadIds.length === 0) return;
    const nextReadNotificationIds = [...readNotificationIds, ...unreadIds];
    setReadNotificationIds(nextReadNotificationIds);
    void saveReadNotificationIds(currentUser.authUserId, nextReadNotificationIds).catch(() => {});
  }, [currentUser, notificationKey, readNotificationIds, screen]);

  useEffect(() => {
    if (!walletEnabled || !['wallet', 'success', 'history', 'settings', 'camera', 'credential', 'share'].includes(screen)) return;
    const refresh = () => {
      if (AppState.currentState === 'background') return;
      void loadCredentialOffers().catch((error) => {
        if (!isSessionError(error)) return;
        setLoginNotice(sessionErrorMessage(error instanceof BackendApiError ? error.code : 'AUTHENTICATION_REQUIRED'));
        setScreen('login');
      });
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    const foregroundSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(interval);
      foregroundSubscription.remove();
    };
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
      setIssuedCredentialDisplay(null);
      setHasCredential(false);
      setCredentialValidity('unknown');
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
      await saveIssuedCredential(currentUser.authUserId, issued, pendingOffer);
      setIssuedCredentialDisplay(credentialDisplayFromOffer(pendingOffer));
      setCredentialOffers((offers) => offers.map((offer) =>
        offer.offerId === issued.offerId ? { ...offer, status: 'issued' } : offer,
      ));
      setHasCredential(true);
      setCredentialValidity('active');
      setHistory((events) => [{
        id: issued.credentialId,
        type: 'issue',
        title: `Issued: ${pendingOffer.displayName}`,
        subtitle: `From ${pendingOffer.issuerName}`,
        targetScreen: 'credential',
      }, ...events]);
      setHasUnreadActivity(true);
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
      if (credentialValidity !== 'active') return;
      setShareOrigin('credential');
      setPinPurpose('share');
      setShareError(null);
      setScreen('unlock_pin');
      return;
    }
    setScreen(nextScreen);
  }, [credentialValidity]);

  const toggleBiometrics = useCallback(async () => {
    if (Platform.OS === 'ios') throw new Error('FaceID coming soon.');
    if (!currentUser) throw new Error('Sign in to change biometric protection.');
    if (!requireBiometrics) {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHardware || !isEnrolled) {
        throw new Error('Set up Face ID or fingerprint on this device before enabling this option.');
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric protection for sharing',
        disableDeviceFallback: true,
      });
      if (!result.success) throw new Error('Biometric verification was cancelled or failed.');
    }
    const nextValue = !requireBiometrics;
    await saveRequireBiometrics(currentUser.authUserId, nextValue);
    setRequireBiometrics(nextValue);
  }, [currentUser, requireBiometrics]);

  const shareProof = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    setShareError(null);
    try {
      if (!currentUser) throw new Error('Sign in to share a credential.');
      const storedCredential = await loadIssuedCredential(currentUser.authUserId);
      if (!storedCredential) throw new Error('No credential is stored in this wallet.');
      setCredentialValidity('unknown');
      const currentOffers = await walletApi.getMyCredentialOffers();
      const currentOffer = currentOffers.find((offer) => offer.offerId === storedCredential.offerId);
      const validity: CredentialValidity = currentOffer?.status === 'issued' ? 'active'
        : currentOffer?.status === 'revoked' ? 'invalid'
        : 'unknown';
      setCredentialValidity(validity);
      if (validity !== 'active') {
        throw new Error(validity === 'invalid' ? 'This credential was revoked and cannot be shared.' : 'Credential status could not be verified. Try again later.');
      }
      if (requireBiometrics && Platform.OS !== 'ios') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify before sharing your credential',
          disableDeviceFallback: true,
        });
        if (!result.success) throw new Error('Biometric verification is required to continue.');
      }
      const sharedCount = Object.values(shareFields).filter(Boolean).length;
      const newHistoryEvent: HistoryEvent = {
        id: `share-${Date.now()}`,
        type: 'share',
        title: shareOrigin === 'camera' ? 'Prepared proof from QR scan' : 'Shared proof with Employer A',
        subtitle: `Education Transcript VC · ${sharedCount} field${sharedCount === 1 ? '' : 's'}`,
        targetScreen: 'receipt',
        sharedFields: { ...shareFields },
        fromCamera: shareOrigin === 'camera',
      };
      setReceiptFields({ ...shareFields });
      setReceiptFromCamera(shareOrigin === 'camera');
      setHistory((previous) => [newHistoryEvent, ...previous]);
      setHasUnreadActivity(true);
      setScreen(shareOrigin === 'camera' ? 'receipt' : 'verification');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Biometric verification failed.');
    } finally {
      setSharing(false);
    }
  }, [currentUser, requireBiometrics, shareFields, shareOrigin, sharing]);

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
            credential={issuedCredentialDisplay}
            credentialValidity={credentialValidity}
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
            credential={issuedCredentialDisplay}
            credentialValidity={credentialValidity}
          />
        );
      case 'credential':
        return (
          <CredentialScreen
            go={goWithShareProtection}
            holderName={registeredName}
            studentId={studentId}
            credential={issuedCredentialDisplay}
            credentialValidity={credentialValidity}
          />
        );
      case 'share':
        return (
          <ShareScreen
            fields={shareFields}
            setFields={setShareFields}
            go={setScreen}
            fromCamera={shareOrigin === 'camera'}
            onShare={() => void shareProof()}
            shareError={shareError}
            sharing={sharing}
            credentialValidity={credentialValidity}
          />
        );
      case 'verification':
        return <VerificationScreen go={setScreen} sharedFields={shareFields} credential={issuedCredentialDisplay} />;
      case 'receipt':
        return (
          <ReceiptScreen
            go={setScreen}
            sharedFields={receiptFields}
            credential={issuedCredentialDisplay}
            onDone={receiptFromCamera ? () => setScreen('wallet') : undefined}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            go={setScreen}
            history={recentActivity}
            onSelectEvent={(event) => {
              if (event.sharedFields) setReceiptFields(event.sharedFields);
              setReceiptFromCamera(event.fromCamera === true);
              setScreen(event.targetScreen);
            }}
          />
        );
      case 'camera':
        return (
          <CameraScreen
            onScanned={() => {
              setShareOrigin('camera');
              setPinPurpose('share');
              setShareError(null);
              setScreen('unlock_pin');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            go={setScreen}
            onSignOut={() => void signOut()}
            onResetWallet={resetWallet}
            requireBiometrics={requireBiometrics}
            onToggleBiometrics={toggleBiometrics}
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
  }, [acceptOnboardingRequest, acceptPendingOffer, authEmail, continueAfterMatch, credentialValidity, currentUser, displayName, goWithShareProtection, hasCredential, holderAccount, issuedCredentialDisplay, issuerProviders, loadHolderState, loginNotice, offerAcceptanceError, offersError, offersLoading, onboardingRequest, pendingOffer, pinPurpose, profilePreferences, providersError, providersLoading, receiptFromCamera, recentActivity, refreshOnboarding, registeredName, requireBiometrics, resetWallet, retryCredentialOffers, retryIssuerProviders, screen, selectIssuerProvider, setupError, shareError, shareFields, shareOrigin, shareProof, sharing, signOut, studentId, toggleBiometrics, walletEnabled]);

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
            active={screen === 'success' ? 'wallet' : (screen as 'wallet' | 'camera' | 'history' | 'settings')}
            go={setScreen}
            hasUnreadNotifications={hasUnreadNotifications}
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
