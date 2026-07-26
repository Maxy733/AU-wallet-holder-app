import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Header, SectionLabel } from '../components';
import { CredentialCard } from '../components/CredentialCard';
import { SummaryStats } from '../components/SummaryStats';
import { Notice } from '../components/Notice';
import { BottomNav } from '../components/BottomNav';
import { colors } from '../theme/constants';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function WalletScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="GOOD AFTERNOON" title={copy.student} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>YOUR CREDENTIALS</SectionLabel>
        <Pressable onPress={() => go('credential')}>
          <CredentialCard />
        </Pressable>
        <SummaryStats />
        <SectionLabel>PENDING</SectionLabel>
        <Notice
          icon="✉"
          tint={colors.red}
          bg={colors.softRed}
          title="AU Registrar wants to issue a credential"
          subtitle="Transportation VC · tap to review"
          onPress={() => go('offer')}
        />
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