import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/constants';

type SecureTextInputProps = Omit<TextInputProps, 'secureTextEntry'> & {
  fieldLabel: string;
  visible: boolean;
  onToggleVisibility: () => void;
};

export function SecureTextInput({
  fieldLabel,
  visible,
  onToggleVisibility,
  style,
  ...props
}: SecureTextInputProps) {
  const action = visible ? 'Hide' : 'Show';

  return (
    <View style={styles.container}>
      <TextInput {...props} style={[style, styles.input]} secureTextEntry={!visible} />
      <Pressable
        accessibilityLabel={`${action} ${fieldLabel}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onToggleVisibility}
        style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
      >
        <Text style={styles.toggleText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    paddingRight: 76,
  },
  toggle: {
    position: 'absolute',
    top: 0,
    right: 6,
    bottom: 0,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePressed: {
    opacity: 0.55,
  },
  toggleText: {
    color: colors.red,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
