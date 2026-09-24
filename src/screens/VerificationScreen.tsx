import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { BackHeader, InfoPanel, PrimaryButton } from '../components';
import { QrMock } from '../components/QrMock';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen, ShareFields } from '../types';

const displayValue = (value: string | number | undefined) => {
  if (value === undefined || (typeof value === 'string' && !value.trim())) return 'Not provided';
  return String(value);
};

export function VerificationScreen({
  go,
  sharedFields,
  credential,
}: {
  go: (screen: Screen) => void;
  sharedFields: ShareFields;
  credential: IssuedCredentialDisplay | null;
}) {
  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Verification result" onBack={() => go('share')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <View style={styles.validBanner}>
          <View style={styles.validIcon}><Text style={styles.validCheck}>✓</Text></View>
          <View>
            <Text style={styles.validTitle}>Credential verified</Text>
            <Text style={styles.validSub}>Issuer and student proof are valid.</Text>
          </View>
        </View>
        <QrMock />
        <Text style={styles.qrCaption}>Verification QR / shared proof</Text>
        <InfoPanel
          title="Disclosed fields"
          rows={[
            ['Degree', sharedFields.degree ? displayValue(credential?.degree) : 'Hidden'],
            ['Major', sharedFields.major ? displayValue(credential?.major) : 'Hidden'],
            ['Graduation', sharedFields.graduation ? displayValue(credential?.graduationDate) : 'Hidden'],
            ['GPA', sharedFields.gpa ? displayValue(credential?.gpa) : 'Hidden'],
          ]}
        />
        <InfoPanel title="Trust chain">
          <Text style={styles.trustText}>AU Registrar → Student Wallet → Employer A</Text>
        </InfoPanel>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Done" onPress={() => go('wallet')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  validBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F7EC',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#C8E6D5',
  },
  validIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.green, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  validCheck: { color: 'white', fontSize: 20, fontWeight: '600' },
  validTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  validSub: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 2 },
  qrCaption: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  trustText: { color: colors.muted, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
