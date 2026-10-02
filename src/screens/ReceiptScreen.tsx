import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { BackHeader, PrimaryButton } from '../components';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { styles as themeStyles } from '../theme/styles';
import { Screen, ShareFields } from '../types';
import { InfoPanel } from '../components/InfoPanel';
import { colors } from '../theme/constants';

const displayValue = (value: string | number | undefined) => {
  if (value === undefined || (typeof value === 'string' && !value.trim())) return 'Not provided';
  return String(value);
};

export function ReceiptScreen({
  go,
  sharedFields,
  credential,
  onDone,
}: {
  go: (screen: Screen) => void;
  sharedFields: ShareFields;
  credential: IssuedCredentialDisplay | null;
  onDone?: () => void;
}) {
  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Disclosure Receipt" onBack={() => go('history')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <InfoPanel
          title="Transaction Summary"
          rows={[
            ['Recipient', 'Employer A'],
            ['Purpose', 'Job Application (JOB-2026-001)'],
            ['Date', '2024-10-27 09:41:21'],
          ]}
        />
        <InfoPanel
          title="Selective Disclosure Receipt"
          rows={[
            ['Degree', sharedFields.degree ? displayValue(credential?.degree) : 'Hidden'],
            ['Major', sharedFields.major ? displayValue(credential?.major) : 'Hidden'],
            ['Graduation', sharedFields.graduation ? displayValue(credential?.graduationDate) : 'Hidden'],
            ['GPA', sharedFields.gpa ? displayValue(credential?.gpa) : 'Hidden'],
          ]}
        />
        <InfoPanel title="Verification & Trust Status">
          <View style={styles.sampleBadge}>
            <Text style={styles.sampleText}>Sample verification results</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustLabel}>Verifier Trust Status</Text>
            <Text style={styles.trustValue}>ETDA Trust Registry</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustLabel}>Credential Issuer</Text>
            <Text selectable style={styles.trustValue}>Assumption University Registrar (did:web:au.edu)</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustLabel}>Presentation Protocol</Text>
            <Text style={styles.trustValue}>OpenID4VP</Text>
          </View>
          <View style={[styles.trustRow, styles.lastRow]}>
            <Text style={styles.trustLabel}>Revocation Check</Text>
            <Text style={[styles.trustValue, styles.passed]}>Passed</Text>
          </View>
        </InfoPanel>
      </ScrollView>
      {onDone ? (
        <View style={themeStyles.actionStack}>
          <PrimaryButton label="Done" onPress={onDone} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sampleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: colors.sand, marginBottom: 4 },
  sampleText: { color: colors.brown, fontSize: 11, fontWeight: '600' },
  trustRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 },
  lastRow: { borderBottomWidth: 0, paddingBottom: 0 },
  trustLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  trustValue: { color: colors.ink, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  passed: { color: colors.green },
});
