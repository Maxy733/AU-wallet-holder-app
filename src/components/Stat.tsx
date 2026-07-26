import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';

export function Stat({ value, label, active }: { value: string; label: string; active?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, active && { color: colors.red }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {},
  statValue: {},
  statLabel: {},
});