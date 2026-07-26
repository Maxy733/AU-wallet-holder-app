import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';

type BackHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function BackHeader({ title, subtitle, onBack }: BackHeaderProps) {
  return (
    <View style={styles.backHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.backButton} onPress={onBack}>
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
  backHeader: {
    height: 70,
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backArrow: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  backTitle: {
    color: colors.ink,
    fontSize: 14.5,
    fontWeight: '700',
  },
  backSub: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
  },
});
