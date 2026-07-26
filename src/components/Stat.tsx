import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles'; // <-- Import centralized styles

export function Stat({ value, label, active }: { value: string; label: string; active?: boolean }) {
  return (
    <View style={themeStyles.stat}>
      <Text style={[themeStyles.statValue, active && { color: colors.red }]}>{value}</Text>
      <Text style={themeStyles.statLabel}>{label}</Text>
    </View>
  );
}