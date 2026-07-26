import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type BackHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function BackHeader({ title, subtitle, onBack }: BackHeaderProps) {
  return (
    <View style={styles.backHeader}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <View>
        <Text style={styles.backTitle}>{title}</Text>
        <Text style={styles.backSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // TODO: Move backHeader, backButton, backArrow, backTitle, and backSub styles here
  backHeader: {},
  backButton: {},
  backArrow: {},
  backTitle: {},
  backSub: {},
});