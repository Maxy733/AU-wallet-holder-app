import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';

// 1. Import your theme and types
import { styles } from './src/theme/styles';
import { colors } from './src/theme/constants';
import { Screen, ShareFields, HistoryEvent } from './src/types';

// 2. Import all your screens
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { IdentityAuthScreen } from './src/screens/IdentityAuthScreen';
import  CreatePinScreen  from './src/screens/CreatePinScreen';
import { IdentityProofingScreen } from './src/screens/IdentityProofingScreen';
import { VerifyingScreen } from './src/screens/VerifyingScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { OfferScreen } from './src/screens/OfferScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { CredentialScreen } from './src/screens/CredentialScreen';
import { ShareScreen } from './src/screens/ShareScreen';
import { VerificationScreen } from './src/screens/VerificationScreen';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomNav } from './src/components';

// 3. The Core App Shell
export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [shareFields, setShareFields] = useState({
    degree: true,
    major: true,
    graduation: true,
    gpa: false,
    standing: false,
  });
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  const showNav = [
    'wallet',
    'history',
    'settings',
  ].includes(screen);

  const content = useMemo(() => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onSignIn={() => setScreen('create_pin')} />;
      case 'identity_auth':
        return <IdentityAuthScreen go={setScreen} />;
      case 'create_pin':
        return <CreatePinScreen go={setScreen} />;
      case 'identity_proofing':
        return <IdentityProofingScreen go={setScreen} />;
      case 'verifying':
        // In a real app, this would be an async check. We simulate it.
        setTimeout(() => {
          setHistory([{
            id: 'initial-issue',
            type: 'issue',
            title: 'Issued: Education Transcript VC',
            subtitle: 'From AU Registrar',
            targetScreen: 'credential',
          }]);
          setScreen('success');
        }, 2500);
        return <VerifyingScreen go={setScreen} />;
      case 'wallet':
        return <WalletScreen go={setScreen} />;
      case 'offer':
        return <OfferScreen go={setScreen} />;
      case 'success':
        return <SuccessScreen go={setScreen} />;
      case 'credential':
        return <CredentialScreen go={setScreen} />;
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
              setHistory(prevHistory => [newHistoryEvent, ...prevHistory]);
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
        return <SettingsScreen go={setScreen} />;
    }
  }, [screen, shareFields]);

  return (
    <SafeAreaView style={styles.appShell}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.phone}>
        {content}
        {showNav && (
          <BottomNav active={screen as 'wallet' | 'history' | 'settings'} go={setScreen} />
        )}
      </View>
    </SafeAreaView>
  );
}