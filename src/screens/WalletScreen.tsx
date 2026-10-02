import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { IssuerProvider } from '../api';
import { Header, IssuerProviderCard, SecondaryButton, SectionLabel } from '../components';
import { CredentialCard, type CredentialValidity } from '../components/CredentialCard';
import { Notice } from '../components/Notice';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import type { HistoryEvent, Screen } from '../types';

function localGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export function WalletScreen({
  go,
  hasCredential,
  offersLoading,
  offersError,
  walletEnabled,
  issuerProviders,
  providersLoading,
  providersError,
  onRetryProviders,
  onRetryOffers,
  onSelectIssuer,
  onSignOut,
  holderName,
  profilePhotoUri,
  credential,
  credentialValidity,
  recentActivity,
  onSelectActivity,
  hasUnreadNotifications,
}: {
  go: (screen: Screen) => void;
  hasCredential: boolean;
  offersLoading: boolean;
  offersError: string | null;
  walletEnabled: boolean;
  issuerProviders: IssuerProvider[];
  providersLoading: boolean;
  providersError: string | null;
  onRetryProviders: () => void;
  onRetryOffers: () => Promise<void>;
  onSelectIssuer: (provider: IssuerProvider) => void;
  onSignOut: () => void;
  holderName: string;
  profilePhotoUri: string | null;
  credential: IssuedCredentialDisplay | null;
  credentialValidity: CredentialValidity;
  recentActivity: HistoryEvent[];
  onSelectActivity: (event: HistoryEvent) => void;
  hasUnreadNotifications: boolean;
}) {
  const [greeting, setGreeting] = useState(localGreeting);
  useEffect(() => {
    const updateGreeting = () => setGreeting(localGreeting());
    const timer = setInterval(updateGreeting, 60_000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') updateGreeting();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const refreshOffers = async () => {
    if (refreshing || !walletEnabled) return;
    setRefreshing(true);
    try {
      await onRetryOffers();
    } finally {
      setRefreshing(false);
    }
  };

  const assumptionUniversity = issuerProviders.find(
    (provider) => provider.issuerCode === 'assumption-university',
  );

  return (
    <View style={themeStyles.screen}>
      <Header
        eyebrow={greeting}
        title={holderName}
        avatarUri={profilePhotoUri}
        onOpenNotifications={walletEnabled ? () => go('notifications') : undefined}
        hasUnreadNotifications={hasUnreadNotifications}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themeStyles.scrollBottom}
        alwaysBounceVertical
        refreshControl={walletEnabled ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshOffers()}
            colors={[colors.red]}
            tintColor={colors.red}
          />
        ) : undefined}
      >
        <SectionLabel>YOUR CREDENTIALS</SectionLabel>
        {hasCredential ? (
          <Pressable onPress={() => go('credential')}>
            <CredentialCard
              validity={credentialValidity}
              degree={credential?.degree || 'Not provided'}
              major={credential?.major || 'Not provided'}
              graduationDate={credential?.graduationDate || 'Not provided'}
              gpa={credential?.gpa ?? 'Not provided'}
              issuerName={credential?.issuerName || 'Not provided'}
            />
          </Pressable>
        ) : (
          <View>
            <View style={themeStyles.emptyWallet}>
              <Text style={themeStyles.emptyWalletTitle}>Your wallet is empty</Text>
            </View>
            <Text style={themeStyles.emptyWalletCopy}>
              {walletEnabled
                ? 'Your identity is verified. You can now receive credentials.'
                : 'Connect a trusted service to verify your identity and unlock wallet features.'}
            </Text>
            <View style={themeStyles.emptyWalletDivider} />
          </View>
        )}

        <View style={styles.servicesHeadingRow}>
          <SectionLabel>TRUSTED SERVICES</SectionLabel>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="See more trusted services"
            onPress={() => go('trusted_services')}
            style={({ pressed }) => [styles.seeMoreLink, pressed && styles.servicePressed]}
          >
            <Text style={styles.seeMoreText}>See More</Text>
          </Pressable>
        </View>

        {providersLoading ? (
          <View style={styles.providerMessage}>
            <ActivityIndicator size="small" color={colors.red} />
            <Text style={styles.providerMessageText}>Loading issuer providers...</Text>
          </View>
        ) : providersError ? (
          <View style={styles.providerMessage}>
            <Text style={styles.providerError}>{providersError}</Text>
            <SecondaryButton label="Try again" onPress={onRetryProviders} />
          </View>
        ) : assumptionUniversity ? (
          <IssuerProviderCard provider={assumptionUniversity} onPress={onSelectIssuer} />
        ) : (
          <Text style={styles.providerError}>Assumption University is not currently listed by the wallet backend.</Text>
        )}

        {walletEnabled ? (
          <View>
            <View style={styles.servicesHeadingRow}>
              <SectionLabel>RECENT ACTIVITY</SectionLabel>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="View all notifications"
                onPress={() => go('notifications')}
                style={({ pressed }) => [styles.seeMoreLink, pressed && styles.servicePressed]}
              >
                <Text style={styles.seeMoreText}>View all</Text>
              </Pressable>
            </View>
            {recentActivity.length === 0 ? (
              <Text style={themeStyles.smallBody}>No notifications yet. Credential and sharing updates will appear here.</Text>
            ) : recentActivity.slice(0, 3).map((event) => (
              <Notice
                key={event.id}
                icon={event.type === 'revoke' ? '!' : event.type === 'offer' ? 'AU' : '✓'}
                tint={event.type === 'offer' || event.type === 'revoke' ? colors.red : colors.green}
                bg={event.type === 'offer' || event.type === 'revoke' ? colors.softRed : '#E5F7EC'}
                title={String(event.title ?? '')}
                subtitle={String(event.subtitle ?? '')}
                onPress={() => onSelectActivity(event)}
              />
            ))}
          </View>
        ) : null}

        {!walletEnabled ? (
          <View style={styles.lockedPanel}>
            <Text style={styles.lockedTitle}>Wallet features are locked</Text>
            <Text style={styles.lockedBody}>Connect and verify with Assumption University to enable credentials, sharing and notifications.</Text>
            <View style={styles.signOutAction}><SecondaryButton label="Sign out" onPress={onSignOut} /></View>
          </View>
        ) : offersLoading ? (
          <View style={styles.providerMessage}>
            <ActivityIndicator size="small" color={colors.red} />
            <Text style={styles.providerMessageText}>Checking for credential offers...</Text>
          </View>
        ) : offersError ? (
          <View style={styles.providerMessage}>
            <Text style={styles.providerError}>{offersError}</Text>
            <SecondaryButton label="Try again" onPress={onRetryOffers} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  servicesHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  servicePressed: { opacity: 0.68 },
  providerMessage: { marginBottom: 10, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center' },
  providerMessageText: { color: colors.muted, fontSize: 12 },
  providerError: { marginBottom: 10, color: colors.red, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  seeMoreLink: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  seeMoreText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  lockedPanel: { marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: colors.softRed },
  lockedTitle: { color: colors.redDark, fontSize: 14, fontWeight: '800' },
  lockedBody: { marginTop: 6, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  signOutAction: { marginTop: 14 },
});
