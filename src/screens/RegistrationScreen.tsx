import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, PrimaryButton, SecureTextInput } from '../components';
import { registrationErrorMessage, walletApi } from '../api';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function RegistrationScreen({
  onBack,
  onRegistered,
}: {
  onBack: () => void;
  onRegistered: (email: string) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const revealLastField = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  const register = async () => {
    const email = personalEmail.trim().toLowerCase();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email.includes('@')) {
      setErrorMessage('Enter your first name, last name and a valid personal email.');
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage('Password must have at least 8 characters, including uppercase, lowercase and a number.');
      return;
    }

    setLoading(true);
    try {
      await walletApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalEmail: email,
        password,
      });
      setPassword('');
      onRegistered(email);
    } catch (error) {
      setErrorMessage(registrationErrorMessage(error));
    } finally {
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Create account" subtitle="Use your personal email" onBack={onBack} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Register for AU Wallet</Text>
          <Text style={styles.body}>You will confirm your email, return to this app and log in before academic verification.</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>First name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={colors.muted} autoComplete="given-name" />
            <Text style={styles.label}>Last name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={colors.muted} autoComplete="family-name" />
            <Text style={styles.label}>Personal email</Text>
            <TextInput style={styles.input} value={personalEmail} onChangeText={setPersonalEmail} placeholder="name@example.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Text style={styles.label}>Password</Text>
            <SecureTextInput
              fieldLabel="password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              onFocus={revealLastField}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="new-password"
              visible={showPassword}
              onToggleVisibility={() => setShowPassword((current) => !current)}
            />
            <Text style={styles.passwordHint}>Include uppercase, lowercase and a number.</Text>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <PrimaryButton label={loading ? 'Creating account...' : 'Create account'} onPress={register} disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, padding: 22, paddingBottom: 52 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '800' },
  body: { marginTop: 9, color: colors.muted, fontSize: 14, lineHeight: 21 },
  panel: { marginVertical: 22, padding: 18, gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card },
  label: { marginTop: 4, color: colors.ink, fontSize: 13, fontWeight: '700' },
  input: { height: 50, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.bg, color: colors.ink, fontSize: 15 },
  passwordHint: { color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  error: { color: colors.red, fontSize: 12.5, lineHeight: 18, marginTop: 4 },
});
