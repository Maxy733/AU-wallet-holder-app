import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { backendErrorMessage, isMockApi, walletApi } from '../api';
import { PrimaryButton, SecondaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function CheckEmailScreen({
  email,
  onReturnToLogin,
}: {
  email: string;
  onReturnToLogin: () => void;
}) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resend = async () => {
    setResending(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      await walletApi.resendConfirmation(email);
      setMessage('If the account is awaiting confirmation, a new email has been sent.');
    } catch (error) {
      setErrorMessage(backendErrorMessage(error, 'Could not resend the confirmation email.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <View style={styles.content}>
        <View style={styles.icon}><Text style={styles.iconText}>@</Text></View>
        <Text style={styles.title}>{isMockApi ? 'Mock account ready' : 'Check your email'}</Text>
        <Text style={styles.body}>
          {isMockApi
            ? 'No confirmation email was sent and no Supabase account was created. Return to the wallet and log in with your personal email.'
            : 'Registration successful. Check your email to confirm your account, then return to the wallet and log in.'}
        </Text>
        <Text style={styles.email}>{email}</Text>
        {message ? <Text style={styles.success}>{message}</Text> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Return to login" onPress={onReturnToLogin} />
        {!isMockApi ? <SecondaryButton label={resending ? 'Sending...' : 'Resend confirmation email'} onPress={() => void resend()} disabled={resending} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 34, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  icon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.softRed, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: colors.red, fontSize: 30, fontWeight: '800' },
  title: { marginTop: 24, color: colors.ink, fontSize: 26, fontWeight: '800' },
  body: { marginTop: 14, color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  email: { marginTop: 10, color: colors.ink, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  success: { marginTop: 22, color: colors.green, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  error: { marginTop: 22, color: colors.red, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
});
