import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { BackHeader, PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { InfoPanel } from '../components';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function OfferScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="New credential issue" subtitle="Step 3 of 4" onBack={() => go('identity_proofing')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <InfoPanel title="Education Transcript VC" rows={[['Issuer', 'AU Registrar'], ['Issuer DID', 'did:web:au.edu/issuer']]} />
        <InfoPanel
          title="Preview"
          rows={[
            ['Name', copy.student],
            ['Degree', copy.degree],
            ['Major', copy.major],
            ['Graduation date', copy.graduationISO],
            ['GPA', copy.gpa],
          ]}
        />
        <InfoPanel title="What happens next">
          <Text style={themeStyles.smallBody}>
            Approving asks you to confirm identity, then after verified, AU signs and stores this credential in your wallet.
          </Text>
        </InfoPanel>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Continue to Login" onPress={() => go('login')} />
        {/* <SecondaryButton label="Decline" onPress={() => go('wallet')} /> */}
      </View>
    </View>
  );
}