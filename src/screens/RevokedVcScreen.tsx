import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { RegistrarContactDetails } from '../components/RegistrarContactDetails';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import type { Screen } from '../types';

export function RevokedVcScreen({ go, revocationReason }: {
  go: (screen: Screen) => void;
  revocationReason?: string | null;
}) {
  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Credential revoked" subtitle="Education Transcript VC" onBack={() => go('credential')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <View style={styles.icon}><Text style={styles.iconText}>!</Text></View>
          <Text accessibilityRole="header" style={styles.title}>Your credential has been revoked</Text>
          <Text style={styles.body}>This credential can no longer be used for job applications. Please contact the administrators or the registrar office for help resolving the revocation.</Text>
        </View>
        <View style={styles.reasonCard}>
          <Text accessibilityRole="header" style={styles.reasonTitle}>Reasons for revocation</Text>
          <Text style={styles.reasonBody}>{revocationReason?.trim() || 'Informations from issuer shown here'}</Text>
        </View>
        <RegistrarContactDetails />
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <SecondaryButton label="Contact support" onPress={() => go('contact_support')} />
        <PrimaryButton label="Done" onPress={() => go('wallet')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 180, gap: 20 },
  reasonCard: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  reasonTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  reasonBody: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  notice: { padding: 22, borderRadius: 22, backgroundColor: colors.softRed, alignItems: 'center' },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  iconText: { color: colors.red, fontSize: 32, fontWeight: '800' },
  title: { color: colors.redDark, fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: 'center' },
});
