import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles as themeStyles } from '../theme/styles'; // <-- Import centralized styles
import { colors } from '../theme/constants'; // <-- Import colors for the danger state

type SettingRowProps = {
  label: string;
  danger?: boolean;
  toggleValue?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export function SettingRow({ label, danger, toggleValue, onPress, disabled = false }: SettingRowProps) {
  const content = (
    <>
      <Text style={[themeStyles.settingLabel, danger && { color: colors.red }]}>{label}</Text>
      {toggleValue !== undefined ? (
        <View style={[themeStyles.switchTrack, toggleValue && themeStyles.switchTrackOn]}>
          <View style={[themeStyles.switchKnob, toggleValue && themeStyles.switchKnobOn]} />
        </View>
      ) : (
        <Text style={themeStyles.chevron}>›</Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole={toggleValue !== undefined ? 'switch' : 'button'}
        accessibilityState={{ ...(toggleValue !== undefined ? { checked: toggleValue } : {}), disabled }}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [themeStyles.settingRow, disabled && { opacity: 0.5 }, pressed && { opacity: 0.68 }]}
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
