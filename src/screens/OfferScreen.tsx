import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import type { CredentialOffer } from '../api';
import { BackHeader, InfoPanel, PrimaryButton, SecondaryButton } from '../components';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function OfferScreen({
  go,
  offer,
  errorMessage,
  onAccept,
}: {
  go: (screen: Screen) => void;
  offer: CredentialOffer;
  errorMessage: string | null;
  onAccept: () => void;
}) {
  return (
    <View style={themeStyles.screen}>
      <BackHeader title="New credential offer" subtitle={`From ${offer.issuerName}`} onBack={() => go('wallet')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <InfoPanel title={offer.displayName} rows={[['Issuer', offer.issuerName], ['Issuer DID', offer.issuerDid]]} />
        <InfoPanel
          title="Preview"
          rows={[
            ['Name', offer.holderName],
            ['Student ID', offer.studentNumber],
            ['Degree', offer.preview.degree || copy.degree],
            ['Major', offer.preview.major || copy.major],
            ['Graduation date', offer.preview.graduationDate || copy.graduationISO],
            ['GPA', String(offer.preview.gpa || copy.gpa)],
          ]}
        />
        <InfoPanel title="What happens next">
          <Text style={themeStyles.smallBody}>
            Approving accepts this issuer-created offer and stores the resulting credential in your wallet.
          </Text>
        </InfoPanel>
        {errorMessage ? <Text style={[themeStyles.smallBody, { color: '#CC1919' }]}>{errorMessage}</Text> : null}
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Approve & continue" onPress={onAccept} />
        <SecondaryButton label="Back" onPress={() => go('wallet')} />
      </View>
    </View>
  );
}
