import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header, SecondaryButton, SectionLabel } from '../components';
import { CredentialCard } from '../components/CredentialCard';
import { Notice } from '../components/Notice';
import { SummaryStats } from '../components/SummaryStats';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

type ConnectionStatus = 'not_connected' | 'under_review' | 'matched' | 'rejected';

export function WalletScreen({
  go,
  hasCredential,
  walletEnabled,
  connectionStatus,
  onConnectAssumption,
  onSignOut,
  holderName,
}: {
  go: (screen: Screen) => void;
  hasCredential: boolean;
  walletEnabled: boolean;
  connectionStatus: ConnectionStatus;
  onConnectAssumption: () => void;
  onSignOut: () => void;
  holderName: string;
}) {
  const connectionCopy = {
    not_connected: { label: 'Connect', detail: 'Verify your AU student status', color: colors.red },
    under_review: { label: 'Review status', detail: 'Student verification under review', color: colors.brown },
    matched: { label: 'Connected', detail: 'Student status verified', color: colors.green },
    rejected: { label: 'Try again', detail: 'Verification needs correction', color: colors.red },
  }[connectionStatus];

  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="GOOD AFTERNOON" title={holderName} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>YOUR CREDENTIALS</SectionLabel>
        {hasCredential ? (
          <Pressable onPress={() => go('credential')}>
            <CredentialCard />
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

        <SummaryStats hasCredential={hasCredential} />

        <SectionLabel>TRUSTED SERVICES</SectionLabel>
        <Text style={styles.serviceIntro}>
          Choose a provider to connect with your personal wallet. Provider verification happens only after you choose to connect.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${connectionCopy.label} Assumption University`}
          disabled={connectionStatus === 'matched'}
          onPress={onConnectAssumption}
          style={({ pressed }) => [styles.serviceCard, pressed && styles.servicePressed]}
        >
          <View style={[styles.serviceLogo, styles.auLogo]}>
            <Image
              source={require('../../assets/Assumption_University_of_Thailand_(logo).png')}
              style={styles.auLogoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.serviceText}>
            <Text style={styles.serviceName}>Assumption University</Text>
            <Text style={styles.serviceDetail}>{connectionCopy.detail}</Text>
          </View>
          <View style={[styles.serviceAction, { borderColor: connectionCopy.color }]}>
            <Text style={[styles.serviceActionText, { color: connectionCopy.color }]}>{connectionCopy.label}</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityHint="Opens a separate page containing the other mock providers"
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
        ) : (
          <>
            <SectionLabel>PENDING</SectionLabel>
            {!hasCredential ? (
              <Notice
                icon="AU"
                tint={colors.red}
                bg={colors.softRed}
                title="AU Registrar wants to issue a credential"
                subtitle="Education Transcript VC - tap to review"
                onPress={() => go('offer')}
              />
            ) : (
              <Notice
                icon="E"
                tint={colors.brown}
                bg={colors.sand}
                title="Employer A requests a verification"
                subtitle="Job application - JOB-2026-001"
                onPress={() => go('share')}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  serviceIntro: { marginTop: -5, marginBottom: 12, color: colors.muted, fontSize: 12, lineHeight: 18 },
  serviceCard: { minHeight: 72, marginBottom: 10, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center' },
  servicePressed: { opacity: 0.68 },
  serviceLogo: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  auLogo: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  auLogoImage: { width: 38, height: 38 },
  serviceText: { flex: 1, marginLeft: 12, marginRight: 8 },
  serviceName: { color: colors.ink, fontSize: 13.5, fontWeight: '700' },
  serviceDetail: { marginTop: 4, color: colors.muted, fontSize: 10.5, lineHeight: 14 },
  serviceAction: { minWidth: 76, height: 30, paddingHorizontal: 9, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  serviceActionText: { fontSize: 10.5, fontWeight: '800' },
  seeMoreButton: { minHeight: 44, marginBottom: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeMoreText: { color: colors.red, fontSize: 12, fontWeight: '800' },
  seeMoreIcon: { color: colors.red, fontSize: 20, fontWeight: '500' },
  lockedPanel: { marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: colors.softRed },
  lockedTitle: { color: colors.redDark, fontSize: 14, fontWeight: '800' },
  lockedBody: { marginTop: 6, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  signOutAction: { marginTop: 14 },
});
