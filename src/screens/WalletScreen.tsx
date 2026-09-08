import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CredentialOffer, IssuerProvider } from '../api';
import { Header, IssuerProviderCard, SecondaryButton, SectionLabel } from '../components';
import { CredentialCard } from '../components/CredentialCard';
import { Notice } from '../components/Notice';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function WalletScreen({
  go,
  hasCredential,
  pendingOffer,
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
}: {
  go: (screen: Screen) => void;
  hasCredential: boolean;
  pendingOffer: CredentialOffer | null;
  offersLoading: boolean;
  offersError: string | null;
  walletEnabled: boolean;
  issuerProviders: IssuerProvider[];
  providersLoading: boolean;
  providersError: string | null;
  onRetryProviders: () => void;
  onRetryOffers: () => void;
  onSelectIssuer: (provider: IssuerProvider) => void;
  onSignOut: () => void;
  holderName: string;
  profilePhotoUri: string | null;
  credential: IssuedCredentialDisplay | null;
}) {
  const assumptionUniversity = issuerProviders.find(
    (provider) => provider.issuerCode === 'assumption-university',
  );

  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="GOOD AFTERNOON" title={holderName} avatarUri={profilePhotoUri} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>YOUR CREDENTIALS</SectionLabel>
        {hasCredential ? (
          <Pressable onPress={() => go('credential')}>
            <CredentialCard
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

        <SectionLabel>TRUSTED SERVICES</SectionLabel>
        <Text style={styles.serviceIntro}>
          Choose a provider to connect with your personal wallet. Provider verification happens only after you choose to connect.
        </Text>

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

        <Pressable
          accessibilityRole="button"
          accessibilityHint="Opens the issuer provider catalogue"
          onPress={() => go('trusted_services')}
          style={({ pressed }) => [styles.seeMoreButton, pressed && styles.servicePressed]}
        >
          <Text style={styles.seeMoreText}>See more services</Text>
          <Text style={styles.seeMoreIcon}>›</Text>
        </Pressable>

        {!walletEnabled ? (
          <View style={styles.lockedPanel}>
            <Text style={styles.lockedTitle}>Wallet features are locked</Text>
            <Text style={styles.lockedBody}>Connect and verify with Assumption University to enable credentials, sharing and activity history.</Text>
            <View style={styles.signOutAction}><SecondaryButton label="Sign out" onPress={onSignOut} /></View>
          </View>
        ) : pendingOffer ? (
          <>
            <SectionLabel>PENDING</SectionLabel>
            <Notice
              icon="AU"
              tint={colors.red}
              bg={colors.softRed}
              title={`${pendingOffer.issuerName} wants to issue a credential`}
              subtitle={`${pendingOffer.displayName} - tap to review`}
              onPress={() => go('offer')}
            />
          </>
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
        ) : (
          <View style={styles.offerRefresh}>
            <SecondaryButton label="Refresh offers" onPress={onRetryOffers} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  serviceIntro: { marginTop: -5, marginBottom: 12, color: colors.muted, fontSize: 12, lineHeight: 18 },
  servicePressed: { opacity: 0.68 },
  providerMessage: { marginBottom: 10, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center' },
  providerMessageText: { color: colors.muted, fontSize: 12 },
  providerError: { marginBottom: 10, color: colors.red, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  offerRefresh: { marginTop: 4 },
  seeMoreButton: { minHeight: 44, marginBottom: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeMoreText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  seeMoreIcon: { color: colors.red, fontSize: 20, fontWeight: '500' },
  lockedPanel: { marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: colors.softRed },
  lockedTitle: { color: colors.redDark, fontSize: 14, fontWeight: '800' },
  lockedBody: { marginTop: 6, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  signOutAction: { marginTop: 14 },
});
