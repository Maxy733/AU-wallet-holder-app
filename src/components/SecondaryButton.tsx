import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles as themeStyles } from '../theme/styles'; // <-- Import centralized styles

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function SecondaryButton({ label, onPress, disabled }: SecondaryButtonProps) {
  return (
    <Pressable style={[themeStyles.secondaryButton, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
      <Text style={themeStyles.secondaryText}>{label}</Text>
    </Pressable>
  );
}
