import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { BackHeader, FieldSwitch, InfoPanel, PrimaryButton } from '../components';
import type { CredentialValidity } from '../components/CredentialCard';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen, ShareFields } from '../types';

export function ShareScreen({
  fields,
  setFields,
  go,
  onShare,
  fromCamera,
  shareError,
  sharing,
  credentialValidity,
}: {
  fields: ShareFields;
  setFields: React.Dispatch<React.SetStateAction<ShareFields>>;
  go: (screen: Screen) => void;
  onShare: () => void;
  fromCamera?: boolean;
  shareError?: string | null;
  sharing?: boolean;
  credentialValidity: CredentialValidity;
}) {
  const toggle = (key: keyof ShareFields) => setFields((current) => ({ ...current, [key]: !current[key] }));

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Share transcript proof" onBack={() => go(fromCamera ? 'camera' : 'credential')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <InfoPanel title="Requested fields">
          <FieldSwitch label="Degree name" code="degree_name" value={fields.degree} onPress={() => toggle('degree')} />
          <FieldSwitch label="Major" code="major" value={fields.major} onPress={() => toggle('major')} />
          <FieldSwitch label="Graduation date" code="graduation_date" value={fields.graduation} onPress={() => toggle('graduation')} />
          <FieldSwitch label="GPA" code="gpa" value={fields.gpa} onPress={() => toggle('gpa')} last />
        </InfoPanel>
        <InfoPanel title="Share preview">
          <Text style={themeStyles.smallBody}>
            {fromCamera
              ? 'Choose the fields for this local preview. No proof is sent by scanning the QR code.'
              : 'Only the fields switched on are included. GPA stays hidden unless you turn it on.'}
          </Text>
        </InfoPanel>
        {!fromCamera && credentialValidity === 'active' ? (
          <View style={styles.toast}>
            <View style={styles.toastDot} />
            <Text style={styles.toastText}>Shared with Employer A · verified in &lt;1s</Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={themeStyles.actionStack}>
        {shareError ? <Text style={styles.shareError}>{shareError}</Text> : null}
        {!shareError && credentialValidity !== 'active' ? (
          <Text style={styles.shareError}>
            {credentialValidity === 'invalid' ? 'This credential was revoked and cannot be shared.' : 'Credential status is unavailable. Try again after reconnecting.'}
          </Text>
        ) : null}
        <PrimaryButton
          label={sharing ? 'Checking biometrics...' : fromCamera ? 'Continue to receipt' : 'Share proof'}
          onPress={onShare}
          disabled={sharing || credentialValidity !== 'active'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
  },
  toastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green, marginRight: 12 },
  toastText: { color: 'white', fontSize: 13, fontWeight: '600' },
  shareError: { color: colors.red, fontSize: 12, textAlign: 'center', marginBottom: 10 },
});
