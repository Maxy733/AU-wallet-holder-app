import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { loginErrorMessage, walletApi } from '../api';
import { BackHeader, PrimaryButton, SecureTextInput } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function LoginScreen({
  initialEmail,
  initialError,
  onBack,
  onLoggedIn,
  onRegister,
}: {
  initialEmail?: string;
  initialError?: string | null;
  onBack: () => void;
  onLoggedIn: () => void;
  onRegister: () => void;
}) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError ?? null);
  const scrollRef = useRef<ScrollView>(null);

  const revealLastField = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  const login = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const session = await walletApi.login({ email: email.trim().toLowerCase(), password });
      setPassword('');
      if (session.user.role !== 'student') {
        await walletApi.logout();
        setErrorMessage('This wallet is available only to student and alumni holder accounts.');
        return;
      }
      onLoggedIn();
    } catch (error) {
      setErrorMessage(loginErrorMessage(error));
    } finally {
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Log in" subtitle="Return after confirming your email" onBack={onBack} />
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.body}>Log in with the personal email and password used during registration.</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>Personal email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="name@example.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            <Text style={styles.label}>Password</Text>
            <SecureTextInput
              fieldLabel="password"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              onFocus={revealLastField}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="current-password"
              visible={showPassword}
              onToggleVisibility={() => setShowPassword((current) => !current)}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <PrimaryButton label={loading ? 'Logging in...' : 'Log in'} onPress={login} disabled={loading} />
          <Pressable onPress={onRegister}><Text style={styles.registerLink}>Need an account? Register</Text></Pressable>
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
  registerLink: { marginTop: 20, color: colors.red, fontSize: 13.5, fontWeight: '700', textAlign: 'center' },
});
