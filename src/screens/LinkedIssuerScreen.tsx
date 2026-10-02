import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader, InfoPanel } from '../components';
import type { CredentialValidity } from '../components/CredentialCard';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

const valueOrMissing = (value?: string) => value?.trim() || 'Not provided';
const displayDate = (value?: string | null) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Not provided';
};

export function LinkedIssuerScreen({
  credential,
  credentialValidity,
  walletEnabled,
  confirmedAt,
  onBack,
}: {
  credential: IssuedCredentialDisplay | null;
  credentialValidity: CredentialValidity;
  walletEnabled: boolean;
  confirmedAt: string | null;
  onBack: () => void;
}) {
  const issuerName = credential?.issuerName?.trim();
  const credentialStatus = !credential ? 'No credential stored'
    : credentialValidity === 'active' ? 'Active'
    : credentialValidity === 'invalid' ? 'Revoked' : 'Unknown';
  const initials = issuerName?.split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Linked issuer" subtitle={issuerName || 'Issuer details'} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.connectionCard}>
          <View style={styles.logoFrame}>
            {issuerName?.toLowerCase().includes('assumption university') ? (
              <Image
                source={require('../../assets/Assumption_University_of_Thailand_(logo).png')}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : <Text style={styles.initials}>{initials}</Text>}
          </View>
          <Text style={styles.issuerName}>{issuerName || 'No credential stored'}</Text>
          <View accessible accessibilityLabel={walletEnabled ? 'Issuer connection enabled' : 'Issuer connection pending'} style={[styles.connectedBadge, !walletEnabled && styles.pendingBadge]}>
            <Text style={[styles.connectedIcon, !walletEnabled && styles.pendingText]}>{walletEnabled ? '✓' : '…'}</Text>
            <Text style={[styles.connectedText, !walletEnabled && styles.pendingText]}>{walletEnabled ? 'Connected' : 'Pending connection'}</Text>
          </View>
          <Text style={styles.body}>{credential
            ? 'Issuer and student details below come from the Education Transcript VC stored in your wallet.'
            : 'Issuer and student details will appear here once a credential is stored in your wallet.'}</Text>
        </View>

        <InfoPanel
          title="Credential details"
          rows={[
            ['Issuer name', valueOrMissing(credential?.issuerName)],
            ['Issuer DID', valueOrMissing(credential?.issuerDid)],
            ['Student name', valueOrMissing(credential?.holderName)],
            ['Student ID', valueOrMissing(credential?.studentNumber)],
            ['Credential status', credentialStatus],
            ['Issued', displayDate(credential?.issuedAt)],
          ]}
        />
        <InfoPanel
          title="Connection details"
          rows={[
            ['Wallet access', walletEnabled ? 'Enabled' : 'Locked'],
            ['Account confirmed', displayDate(confirmedAt)],
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 44, gap: 14 },
  connectionCard: { padding: 22, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center' },
  logoFrame: { width: 82, height: 82, borderWidth: 1, borderColor: colors.border, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 70, height: 70 },
  initials: { color: colors.red, fontSize: 24, fontWeight: '800' },
  issuerName: { marginTop: 14, color: colors.ink, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  connectedBadge: { marginTop: 10, minHeight: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: '#E5F7EC', flexDirection: 'row', alignItems: 'center', gap: 5 },
  connectedIcon: { color: colors.green, fontSize: 11, fontWeight: '900' },
  connectedText: { color: colors.green, fontSize: 11.5, fontWeight: '800' },
  pendingBadge: { backgroundColor: colors.sand },
  pendingText: { color: colors.brown },
  body: { marginTop: 14, color: colors.muted, fontSize: 12.5, lineHeight: 19, textAlign: 'center' },
});
