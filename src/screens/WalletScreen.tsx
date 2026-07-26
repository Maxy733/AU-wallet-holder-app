import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { Header, SectionLabel } from '../components';
import { CredentialCard } from '../components/CredentialCard';
import { SummaryStats } from '../components/SummaryStats';
import { Notice } from '../components/Notice';
import { colors } from '../theme/constants';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function WalletScreen({
  go,
  hasCredential,
}: {
  go: (screen: Screen) => void;
  hasCredential: boolean;
}) {
  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="GOOD AFTERNOON" title={copy.student} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>YOUR CREDENTIALS</SectionLabel>
        {hasCredential ? (
          <Pressable onPress={() => go('credential')}>
            <CredentialCard />
          </Pressable>
        ) : (
          <View>
            <View style={themeStyles.emptyWallet}>
              <Text style={themeStyles.emptyWalletTitle}>Your wallet is empty</Text>
            </View>
            <Text style={themeStyles.emptyWalletCopy}>
              No credential yet - check back{`\n`}after AU Registrar issues one
            </Text>
            <View style={themeStyles.emptyWalletDivider} />
          </View>
        )}
        <SummaryStats hasCredential={hasCredential} />
        <SectionLabel>PENDING</SectionLabel>
        {!hasCredential && (
          <Notice
            icon="✉"
            tint={colors.red}
            bg={colors.softRed}
            title="AU Registrar wants to issue a credential"
            subtitle="Education Transcript VC · tap to review"
            onPress={() => go('offer')}
          />
        )}
        <Notice
          icon="◆"
          tint={colors.brown}
          bg={colors.sand}
          title="Employer A requests a verification"
          subtitle="Job application · JOB-2026-001"
          onPress={() => go('share')}
        />
      </ScrollView>
    </View>
  );
}
