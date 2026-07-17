import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function SecondaryButton({ label, onPress }: SecondaryButtonProps) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // TODO: Move styles.secondaryButton and styles.secondaryText here
  secondaryButton: {},
  secondaryText: {},
});