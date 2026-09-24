import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { backendErrorMessage, isSessionError, walletApi } from '../api';
import { BackHeader, PrimaryButton, SecureTextInput } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function ResetPasswordScreen({
  accessToken,
  onBack,
  onComplete,
}: {
  accessToken: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updatePassword = async () => {
    setErrorMessage(null);
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('Use at least 8 characters with uppercase, lowercase, and a number.');
      return;
    }
    if (password !== confirmation) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await walletApi.completePasswordReset(accessToken, password);
      setPassword('');
      setConfirmation('');
      onComplete();
    } catch (error) {
      setErrorMessage(isSessionError(error)
        ? 'The reset link is invalid or expired. Request a new one.'
        : backendErrorMessage(error, 'The password could not be updated. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Create new password" subtitle="Secure your holder account" onBack={onBack} />
      <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Choose a new password</Text>
          <Text style={styles.body}>Use at least 8 characters with uppercase, lowercase, and a number.</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>New password</Text>
            <SecureTextInput
              fieldLabel="new password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="new-password"
              visible={showPassword}
              onToggleVisibility={() => setShowPassword((current) => !current)}
            />
            <Text style={styles.label}>Confirm new password</Text>
            <SecureTextInput
              fieldLabel="password confirmation"
              style={styles.input}
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="Confirm new password"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="new-password"
              visible={showConfirmation}
              onToggleVisibility={() => setShowConfirmation((current) => !current)}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <PrimaryButton label={loading ? 'Updating...' : 'Update password'} onPress={() => void updatePassword()} disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, padding: 24 },
  title: { marginTop: 24, color: colors.ink, fontSize: 27, fontWeight: '800' },
  body: { marginTop: 9, color: colors.muted, fontSize: 14, lineHeight: 21 },
  panel: { marginVertical: 26, padding: 18, gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card },
  label: { marginTop: 3, color: colors.ink, fontSize: 13, fontWeight: '700' },
  input: { height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.bg, color: colors.ink, fontSize: 15 },
  error: { marginTop: 4, color: colors.red, fontSize: 12.5, lineHeight: 18 },
});
