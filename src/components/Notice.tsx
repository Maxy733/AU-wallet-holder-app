import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

export function Notice({
  icon,
  tint,
  bg,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  tint: string;
  bg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={themeStyles.notice} onPress={onPress}>
      <View style={[themeStyles.noticeIcon, { backgroundColor: bg }]}>
        <Text style={[themeStyles.noticeIconText, { color: tint }]}>{icon}</Text>
      </View>
      <View style={themeStyles.noticeText}>
        <Text style={themeStyles.noticeTitle}>{title}</Text>
        <Text style={themeStyles.noticeSub}>{subtitle}</Text>
      </View>
      <Text style={themeStyles.chevron}>›</Text>
    </Pressable>
  );
}