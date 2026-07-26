import React from 'react';
import { Text, View } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

export function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={themeStyles.header}>
      <View>
        <Text style={[themeStyles.eyebrow, !title.includes(' ') && { marginTop: 10 }]}>{eyebrow}</Text>
        <Text style={themeStyles.headerTitle}>{title}</Text>
      </View>
      {title.includes(' ') && (
        <View style={themeStyles.avatar}>
          <Text style={themeStyles.avatarText}>EC</Text>
        </View>
      )}
    </View>
  );
}