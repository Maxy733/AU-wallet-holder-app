import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/constants';

export function QrMock() {
  // These are the specific block indexes that make up the AU QR pattern
  const filled = new Set([
    0, 1, 2, 3, 4, 5, 6, 7, 10, 13, 14, 16, 19, 21, 22, 25, 28, 29, 30, 31, 34,
    35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
  ]);

  return (
    <View style={styles.qr}>
      {Array.from({ length: 49 }).map((_, index) => (
        <View
          key={index}
          style={[styles.qrPixel, filled.has(index) && styles.qrPixelOn]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  qr: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5.2,
  },
  qrPixel: {
    width: 7.7,
    height: 7.7,
    borderRadius: 2,
    backgroundColor: colors.card,
  },
  qrPixelOn: {
    backgroundColor: colors.ink,
  },
});