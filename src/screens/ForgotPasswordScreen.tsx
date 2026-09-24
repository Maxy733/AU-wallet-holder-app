import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';

import { backendErrorMessage, walletApi } from '../api';
import { BackHeader, PrimaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

const redirectUrl = Linking.createURL('/reset-password');

export function ForgotPasswordScreen({
  initialEmail,
  onBack,
}: {
  initialEmail?: string;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    setErrorMessage(null);
    setSent(false);
    if (!normalizedEmail) {
      setErrorMessage('Enter your personal email.');
      return;
    }

    setLoading(true);
    try {
      await walletApi.forgotPassword(normalizedEmail, redirectUrl);
      setEmail(normalizedEmail);
      setSent(true);
    } catch (error) {
      setErrorMessage(backendErrorMessage(error, 'The reset email could not be requested. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Reset password" subtitle="Recover your holder account" onBack={onBack} />
      <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Forgot your password?</Text>
          <Text style={styles.body}>Enter the personal email used for your wallet account. We’ll send a secure reset link if the account exists.</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>Personal email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {sent ? <Text style={styles.success}>Check your email and open the reset link on this device.</Text> : null}
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <PrimaryButton label={loading ? 'Sending...' : sent ? 'Send again' : 'Send reset link'} onPress={() => void requestReset()} disabled={loading} />
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
  panel: { marginVertical: 26, padding: 18, gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  input: { height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.bg, color: colors.ink, fontSize: 15 },
  success: { color: colors.green, fontSize: 13, lineHeight: 19 },
  error: { color: colors.red, fontSize: 12.5, lineHeight: 18 },
});
