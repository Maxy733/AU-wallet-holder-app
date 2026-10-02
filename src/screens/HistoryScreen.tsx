import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Header } from '../components/Header';
import { BackHeader } from '../components/BackHeader';
import { SectionLabel } from '../components/SectionLabel';
import { Notice } from '../components/Notice';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { HistoryEvent, Screen } from '../types';

export function HistoryScreen({
  go,
  history,
  onSelectEvent,
  title = 'History',
  onBack,
}: {
  go: (screen: Screen) => void;
  history: HistoryEvent[];
  onSelectEvent?: (event: HistoryEvent) => void;
  title?: 'History' | 'Notifications';
  onBack?: () => void;
}) {
  return (
    <View style={themeStyles.screen}>
      {onBack ? <BackHeader title={title} onBack={onBack} /> : <Header eyebrow={title === 'History' ? 'EMPLOYER TRANSACTIONS' : 'WALLET UPDATES'} title={title} showAvatar={false} />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <SectionLabel>{title === 'History' ? 'EMPLOYER TRANSACTIONS' : 'RECENT ACTIVITY'}</SectionLabel>
        {history.length === 0 ? (
          <Text style={themeStyles.smallBody}>{title === 'History' ? 'No employer transactions yet. Your credential-sharing history will appear here.' : 'No notifications yet. Credential and sharing updates will appear here.'}</Text>
        ) : null}
        {history.map(event => (
          <Notice
            key={event.id}
            icon={event.type === 'revoke' ? '!' : event.type === 'offer' ? 'AU' : '✓'}
            tint={event.type === 'offer' || event.type === 'revoke' ? colors.red : colors.green}
            bg={event.type === 'offer' || event.type === 'revoke' ? colors.softRed : '#E5F7EC'}
            title={String(event.title ?? '')}
            subtitle={String(event.subtitle ?? '')}
            onPress={() => {
              if (onSelectEvent) onSelectEvent(event);
              else go(event.targetScreen);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
