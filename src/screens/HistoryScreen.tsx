import React from 'react';
import { View, ScrollView } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { Header } from '../components/Header';
import { SectionLabel } from '../components/SectionLabel';
import { Notice } from '../components/Notice';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

type HistoryItem = {
  id: string | number;
  targetScreen: Screen;
  [key: string]: unknown;
};

export function HistoryScreen({ go, history }: { go: (screen: Screen) => void; history: HistoryItem[] }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <Header eyebrow="Wallet Activity" title="History" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>THIS WEEK</SectionLabel>
        {history.map(event => (
          <Notice
            key={event.id}
            icon="✓"
            tint={colors.green}
            bg={'#E5F7EC'}
            title={String(event.title ?? '')}
            subtitle={String(event.subtitle ?? '')}
            onPress={() => go(event.targetScreen)}
          />
        ))}
      </ScrollView>
    </View>
  );
}