import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Header } from '../components/Header';
import { SectionLabel } from '../components/SectionLabel';
import { Notice } from '../components/Notice';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { HistoryEvent, Screen } from '../types';

export function HistoryScreen({
  go,
  history,
  onSelectEvent,
}: {
  go: (screen: Screen) => void;
  history: HistoryEvent[];
  onSelectEvent?: (event: HistoryEvent) => void;
}) {
  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="WALLET UPDATES" title="Notifications" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>RECENT ACTIVITY</SectionLabel>
        {history.length === 0 ? (
          <Text style={themeStyles.smallBody}>No notifications yet. Credential and sharing updates will appear here.</Text>
        ) : null}
        {history.map(event => (
          <Notice
            key={event.id}
            icon={event.type === 'revoke' ? '!' : event.type === 'offer' ? 'AU' : '✓'}
            tint={event.type === 'offer' || event.type === 'revoke' ? colors.red : colors.green}
            bg={event.type === 'offer' || event.type === 'revoke' ? colors.softRed : '#E5F7EC'}
            title={String(event.title ?? '')}
            subtitle={String(event.subtitle ?? '')}
            onPress={() => onSelectEvent?.(event) ?? go(event.targetScreen)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
