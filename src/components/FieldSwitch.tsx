import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styles as themeStyles } from '../theme/styles';

export function FieldSwitch({
  label,
  code,
  value,
  onPress,
  last,
}: {
  label: string;
  code: string;
  value: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable style={[themeStyles.switchRow, last && { marginBottom: 0 }]} onPress={onPress}>
      <View>
        <Text style={themeStyles.switchLabel}>{label}</Text>
        <Text style={themeStyles.switchCode}>{code}</Text>
      </View>
      <View style={[themeStyles.switchTrack, value && themeStyles.switchTrackOn]}>
        <View style={[themeStyles.switchKnob, value && themeStyles.switchKnobOn]} />
      </View>
    </Pressable>
  );
}