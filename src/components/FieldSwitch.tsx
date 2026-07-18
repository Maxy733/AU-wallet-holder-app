import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type FieldSwitchProps = {
  label: string;
  code: string;
  value: boolean;
  onPress: () => void;
  last?: boolean;
};

export function FieldSwitch({ label, code, value, onPress, last }: FieldSwitchProps) {
  return (
    <Pressable style={[styles.switchRow, last && { marginBottom: 0 }]} onPress={onPress}>
      <View>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchCode}>{code}</Text>
      </View>
      <View style={[styles.switchTrack, value && styles.switchTrackOn]}>
        <View style={[styles.switchKnob, value && styles.switchKnobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // TODO: Move switchRow, switchLabel, switchCode, switchTrack, switchTrackOn, switchKnob, and switchKnobOn styles here
  switchRow: {},
  switchLabel: {},
  switchCode: {},
  switchTrack: {},
  switchTrackOn: {},
  switchKnob: {},
  switchKnobOn: {},
});