import React from 'react';
import { View, Text } from 'react-native';
import { styles as themeStyles } from '../theme/styles'; // <-- Import centralized styles
import { colors } from '../theme/constants'; // <-- Import colors for the danger state

type SettingRowProps = {
  label: string;
  danger?: boolean;
  toggleOn?: boolean;
};

export function SettingRow({ label, danger, toggleOn }: SettingRowProps) {
  return (
    <View style={themeStyles.settingRow}>
      <Text style={[themeStyles.settingLabel, danger && { color: colors.red }]}>{label}</Text>
      {toggleOn ? (
        <View style={[themeStyles.switchTrack, themeStyles.switchTrackOn]}>
          <View style={[themeStyles.switchKnob, themeStyles.switchKnobOn]} />
        </View>
      ) : (
        <Text style={themeStyles.chevron}>›</Text>
      )}
    </View>
  );
}