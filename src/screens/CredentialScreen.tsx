import React from 'react';
import { ScrollView, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { InfoPanel } from '../components/InfoPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CredentialCard } from '../components/CredentialCard';
import type { IssuedCredentialDisplay } from '../lib/credentialStore';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

const displayValue = (value: string | number | undefined) => {
  if (value === undefined || (typeof value === 'string' && !value.trim())) return 'Not provided';
  return String(value);
};

export function CredentialScreen({
  go,
  holderName,
  studentId,
  credential,
}: {
  go: (screen: Screen) => void;
  holderName: string;
  studentId: string;
  credential: IssuedCredentialDisplay | null;
}) {
  const displayedHolderName = credential?.holderName || holderName;
  const displayedStudentId = credential?.studentNumber || studentId;

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Education Transcript VC" subtitle="Stored · ready for verification" onBack={() => go('wallet')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <CredentialCard
          compact
          holderName={displayedHolderName}
          degree={displayValue(credential?.degree)}
          major={displayValue(credential?.major)}
          gpa={displayValue(credential?.gpa)}
          graduationDate={displayValue(credential?.graduationDate)}
          issuerName={credential?.issuerName}
        />
        <InfoPanel
          title="Credential claims"
          rows={[
            ['Student ID', displayedStudentId],
            ['Degree', displayValue(credential?.degree)],
            ['Major', displayValue(credential?.major)],
            ['Graduation', displayValue(credential?.graduationDate)],
            ['GPA', displayValue(credential?.gpa)],
          ]}
        />
        <InfoPanel
          title="Metadata"
          rows={[
            ['Issuer DID', displayValue(credential?.issuerDid)],
            ['Status', 'Active'],
            ['Storage', 'Permanent'],
          ]}
        />
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Use for job application" onPress={() => go('share')} />
      </View>
    </View>
  );
}
