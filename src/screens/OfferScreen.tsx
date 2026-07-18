import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { InfoPanel } from '../components';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function OfferScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      {/* <BackHeader title="New credential offer" subtitle="From AU Registrar" onBack={() => go('wallet')} /> */}
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
        {/* <PrimaryButton label="Approve & continue" onPress={() => go('success')} /> */}
        {/* <SecondaryButton label="Decline" onPress={() => go('wallet')} /> */}
      </View>
    </View>
  );
}