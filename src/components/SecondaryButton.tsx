import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles as themeStyles } from '../theme/styles'; // <-- Import centralized styles

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable style={themeStyles.secondaryButton} onPress={onPress}>
      <Text style={themeStyles.secondaryText}>{label}</Text>
    </Pressable>
  );
}