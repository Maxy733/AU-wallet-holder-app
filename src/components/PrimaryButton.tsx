import React from 'react';
import { Pressable, Text } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable style={themeStyles.primaryButton} onPress={onPress}>
      <Text style={themeStyles.primaryText}>{label}</Text>
    </Pressable>
  );
}