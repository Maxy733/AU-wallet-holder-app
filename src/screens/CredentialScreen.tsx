import React from 'react';
import { ScrollView, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { InfoPanel } from '../components/InfoPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CredentialCard, type CredentialValidity } from '../components/CredentialCard';
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
  credentialValidity,
}: {
  go: (screen: Screen) => void;
  holderName: string;
  studentId: string;
  credential: IssuedCredentialDisplay | null;
  credentialValidity: CredentialValidity;
}) {
  const displayedHolderName = credential?.holderName || holderName;
  const displayedStudentId = credential?.studentNumber || studentId;

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Education Transcript VC" subtitle={credentialValidity === 'active' ? 'Stored · ready for verification' : credentialValidity === 'invalid' ? 'Stored · revoked by issuer' : 'Stored · status unavailable'} onBack={() => go('wallet')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <CredentialCard
          validity={credentialValidity}
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
            ['Status', credentialValidity === 'active' ? 'Active' : credentialValidity === 'invalid' ? 'Invalid (revoked)' : 'Unknown'],
            ['Storage', 'Permanent'],
          ]}
        />
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Use for job application" onPress={() => go('share')} disabled={credentialValidity !== 'active'} />
      </View>
    </View>
  );
}
