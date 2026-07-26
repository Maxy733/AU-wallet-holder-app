import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { BackHeader, PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { Screen } from '../types';

export function IdentityAuthScreen({ go }: { go: (screen: Screen) => void }) {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!studentId.trim() || !email.trim()) {
      setError('Enter your student ID and university email.');
      return;
    }
    setError('');
    go('identity_proofing');
  };

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="AU account" subtitle="Step 2 of 3" onBack={() => go('create_pin')} />
      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeTitle}>Account information</Text>
        <Text style={styles.centerBody}>Enter the AU details connected to your student account.</Text>
      </View>
      <View style={[styles.infoPanel, { marginHorizontal: 20, marginTop: 40, gap: 12 }]}>
        <Text style={styles.panelHeading}>Student ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 6412345"
          placeholderTextColor={colors.muted}
          value={studentId}
          onChangeText={(value) => { setStudentId(value); setError(''); }}
        />
        <Text style={styles.panelHeading}>University Email</Text>
        <TextInput
          style={styles.input}
          placeholder="student@u.au.edu"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={(value) => { setEmail(value); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Continue" onPress={handleNext} />
      </View>
    </View>
  );
}

export default IdentityAuthScreen;

const styles = StyleSheet.create({
  welcomeCopy: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  welcomeTitle: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  centerBody: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  infoPanel: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: '#1C1A17',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  panelHeading: {
    color: colors.ink,
    fontSize: 12.5,
    fontWeight: '700',
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    lineHeight: 17,
  },
});
