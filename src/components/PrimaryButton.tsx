import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // TODO: Move styles.primaryButton and styles.primaryText here
  primaryButton: {},
  primaryText: {},
});