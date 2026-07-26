import React from 'react';
import { Text } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={themeStyles.sectionLabel}>{children}</Text>;
}