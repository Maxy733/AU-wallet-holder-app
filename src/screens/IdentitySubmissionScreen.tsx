import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackendApiError, OnboardingRequest, walletApi } from '../api';
import { BackHeader, PrimaryButton, SecureTextInput } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

function formatDateOfBirth(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join('-');
}

export function IdentitySubmissionScreen({
  onSubmitted,
  onSignOut,
}: {
  onSubmitted: (request: OnboardingRequest) => void;
  onSignOut: () => void;
}) {
  const [admissionNo, setAdmissionNo] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [showPassportNumber, setShowPassportNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const revealLastField = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  const submit = async () => {
    setErrorMessage(null);
    if (!admissionNo.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) || !passportNumber.trim()) {
      setErrorMessage('Complete every field. Date of birth must use YYYY-MM-DD.');
      return;
    }

    setLoading(true);
    try {
      const request = await walletApi.submitOnboarding({
        admissionNo: admissionNo.trim(),
        dateOfBirth,
        passportNumber: passportNumber.trim(),
      });
      setPassportNumber('');
      onSubmitted(request);
    } catch (error) {
      if (error instanceof BackendApiError && error.code === 'ONBOARDING_REQUEST_ACTIVE') {
        setErrorMessage('An onboarding request is already active. Check its current status.');
      } else {
        setErrorMessage(error instanceof BackendApiError ? error.message : 'Could not submit your verification request.');
      }
    } finally {
      // Passport data remains only in the input while this screen is open.
      setPassportNumber('');
      setLoading(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Academic verification" subtitle="Required before wallet activation" onBack={onSignOut} />
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
          <Text style={styles.title}>Verify your AU record</Text>
          <Text style={styles.body}>The issuer will compare these values with the university’s official records.</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>Admission number</Text>
            <TextInput style={styles.input} value={admissionNo} onChangeText={setAdmissionNo} placeholder="Enter admission number" placeholderTextColor={colors.muted} autoCapitalize="characters" autoCorrect={false} />
            <Text style={styles.label}>Date of birth</Text>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={(value) => {
                setErrorMessage(null);
                setDateOfBirth(formatDateOfBirth(value));
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Text style={styles.label}>Passport number</Text>
            <SecureTextInput
              fieldLabel="passport number"
              style={styles.input}
              value={passportNumber}
              onChangeText={setPassportNumber}
              onFocus={revealLastField}
              placeholder="Enter passport number"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              visible={showPassportNumber}
              onToggleVisibility={() => setShowPassportNumber((current) => !current)}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <Text style={styles.privacy}>The wallet does not log or permanently store your passport value. It is discarded after submission.</Text>
          <PrimaryButton label={loading ? 'Submitting...' : 'Submit for issuer review'} onPress={submit} disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 60 },
  title: { color: colors.ink, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  body: { marginTop: 8, color: colors.muted, fontSize: 14, lineHeight: 21 },
  panel: { marginVertical: 22, padding: 18, gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 5 },
  input: { height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.bg, color: colors.ink, fontSize: 15 },
  error: { color: colors.red, fontSize: 12.5, lineHeight: 18, marginTop: 5 },
  privacy: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginBottom: 18 },
});
