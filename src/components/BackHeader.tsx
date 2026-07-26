import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

type BackHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function BackHeader({ title, subtitle, onBack }: BackHeaderProps) {
  return (
    <View style={themeStyles.backHeader}>
      <Pressable style={themeStyles.backButton} onPress={onBack}>
        <Text style={themeStyles.backArrow}>←</Text>
      </Pressable>
      <View>
        <Text style={themeStyles.backTitle}>{title}</Text>
        <Text style={themeStyles.backSub}>{subtitle}</Text>
      </View>
    </View>
  );
}