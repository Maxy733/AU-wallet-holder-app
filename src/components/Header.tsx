import React from 'react';
import { Text, View } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

type HeaderProps = {
  eyebrow: string;
  title: string;
  showAvatar?: boolean;
};

export function Header({ eyebrow, title, showAvatar = true }: HeaderProps) {
  return (
    <View style={themeStyles.header}>
      <View>
        <Text style={[themeStyles.eyebrow, !title.includes(' ') && { marginTop: 10 }]}>{eyebrow}</Text>
        <Text style={themeStyles.headerTitle}>{title}</Text>
      </View>
      {showAvatar && title.includes(' ') && (
        <View style={themeStyles.avatar}>
          <Text style={themeStyles.avatarText}>EC</Text>
        </View>
      )}
    </View>
  );
}