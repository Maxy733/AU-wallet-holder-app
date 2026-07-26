import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { BackHeader } from '../components/BackHeader';
import { InfoPanel } from '../components/InfoPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CredentialCard } from '../components/CredentialCard';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function CredentialScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="Education Transcript VC" subtitle="Stored · ready for verification" onBack={() => go('wallet')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <CredentialCard compact />
        <InfoPanel
          title="Credential claims"
          rows={[
            ['Student ID', copy.id],
            ['Degree', 'B.Sc.'],
            ['Major', copy.major],
            ['Graduation', copy.graduationISO],
            ['GPA', copy.gpa],
            ['Standing', 'Distinction'],
          ]}
        />
        <InfoPanel title="Metadata" rows={[['Issuer DID', 'did:web:au.edu'], ['Status', 'Active'], ['Storage', 'Permanent']]} />
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Use for job application" onPress={() => go('share')} />
      </View>
    </View>
  );
}