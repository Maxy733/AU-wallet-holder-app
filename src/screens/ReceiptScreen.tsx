import React from 'react';
import { View, ScrollView } from 'react-native';
import { BackHeader, PrimaryButton } from '../components';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { styles as themeStyles } from '../theme/styles';
import { Screen, ShareFields } from '../types';
import { InfoPanel } from '../components/InfoPanel';

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
        <InfoPanel
          title="Cryptographic Metadata"
          rows={[
            ['Transaction ID', '0xabc...789'],
            ['Signature', '0x123...def'],
            ['Timestamp', '1672531200'],
          ]}
        />
      </ScrollView>
      {onDone ? (
        <View style={themeStyles.actionStack}>
          <PrimaryButton label="Done" onPress={onDone} />
        </View>
      ) : null}
    </View>
  );
}
