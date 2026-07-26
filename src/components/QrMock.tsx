import React from 'react';
import { View } from 'react-native';
import { styles as themeStyles } from '../theme/styles'; // <-- Import your centralized styles

export function QrMock() {
  const filled = new Set([
    0, 1, 2, 3, 4, 5, 6, 7, 10, 13, 14, 16, 19, 21, 22, 25, 28, 29, 30, 31, 34,
    35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
  ]);

  return (
    <View style={themeStyles.qr}>
      {Array.from({ length: 49 }).map((_, index) => (
        <View
          key={index}
          style={[themeStyles.qrPixel, filled.has(index) && themeStyles.qrPixelOn]}
        />
      ))}
    </View>
  );
}