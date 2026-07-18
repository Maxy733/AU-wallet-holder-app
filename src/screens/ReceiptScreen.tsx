import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { BackHeader, PrimaryButton } from '../components';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';
import { InfoPanel } from '../components/InfoPanel';

export function ReceiptScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="Disclosure Receipt" subtitle="Shared with Employer A" onBack={() => go('history')} />
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
          rows={[['Degree', copy.degree], ['Major', copy.major], ['Graduation', copy.graduationISO]]}
        />
        <InfoPanel
          title="Cryptographic Metadata"
          rows={[['Transaction ID', '0xabc...789'], ['Signature', '0x123...def'], ['Timestamp', '1672531200']]}
        />
      </ScrollView>
    </View>
  );
}