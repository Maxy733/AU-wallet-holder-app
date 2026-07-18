import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import { colors } from '../theme'; // Assuming you have a theme file

type SettingRowProps = {
  label: string;
  danger?: boolean;
  toggleOn?: boolean;
};

export function SettingRow({ label, danger, toggleOn }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, danger && { color: 'red' /* colors.red */ }]}>{label}</Text>
      {toggleOn ? (
        <View style={[styles.switchTrack, styles.switchTrackOn]}>
          <View style={[styles.switchKnob, styles.switchKnobOn]} />
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // TODO: Move settingRow, settingLabel, chevron, and switch styles here
  settingRow: {},
  settingLabel: {},
  chevron: {},
  // You might share switch styles with FieldSwitch or duplicate them
  switchTrack: {},
  switchTrackOn: {},
  switchKnob: {},
  switchKnobOn: {},
});