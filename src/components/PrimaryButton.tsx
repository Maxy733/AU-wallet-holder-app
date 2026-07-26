import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <Pressable style={[themeStyles.primaryButton, disabled && { opacity: 0.5 }]} onPress={onPress} disabled={disabled}>
      <Text style={themeStyles.primaryText}>{label}</Text>
    </Pressable>
  );
}