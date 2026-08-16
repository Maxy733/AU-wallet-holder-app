import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles as themeStyles } from '../theme/styles'; // <-- Import centralized styles
import { colors } from '../theme/constants'; // <-- Import colors for the danger state

type SettingRowProps = {
  label: string;
  danger?: boolean;
  toggleOn?: boolean;
  onPress?: () => void;
};

export function SettingRow({ label, danger, toggleOn, onPress }: SettingRowProps) {
  const content = (
    <>
      <Text style={[themeStyles.settingLabel, danger && { color: colors.red }]}>{label}</Text>
      {toggleOn ? (
        <View style={[themeStyles.switchTrack, themeStyles.switchTrackOn]}>
          <View style={[themeStyles.switchKnob, themeStyles.switchKnobOn]} />
        </View>
      ) : (
        <Text style={themeStyles.chevron}>›</Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [themeStyles.settingRow, pressed && { opacity: 0.68 }]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={themeStyles.settingRow}>
      {content}
    </View>
  );
}
