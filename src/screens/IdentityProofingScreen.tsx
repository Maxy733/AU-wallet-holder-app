import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { BackHeader, PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { Screen } from '../types';

export function IdentityProofingScreen({ go, onComplete }: { go: (screen: Screen) => void; onComplete: () => void }) {
  const [passport, setPassport] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [error, setError] = useState('');

  const handleComplete = () => {
    if (!fullName.trim() || !passport.trim() || nationalId.length !== 13 || !graduationDate.trim()) {
      setError('Complete every field and enter a 13-digit National ID.');
      return;
    }
    setError('');
    onComplete();
  };

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="Personal details" subtitle="Step 3 of 3" onBack={() => go('identity_auth')} />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={[styles.infoPanel, { gap: 8 }]}>
          <Text style={styles.switchLabel}>Full Name (as per Passport)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={colors.muted}
            value={fullName}
            onChangeText={(value) => { setFullName(value); setError(''); }}
          />

          <Text style={styles.switchLabel}>Passport Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter passport number"
            placeholderTextColor={colors.muted}
            value={passport}
            onChangeText={(value) => { setPassport(value); setError(''); }}
          />

          <Text style={styles.switchLabel}>National ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 13-digit ID"
            placeholderTextColor={colors.muted}
            value={nationalId}
            onChangeText={(value) => { setNationalId(value.replace(/\D/g, '')); setError(''); }}
            keyboardType="numeric"
            maxLength={13}
          />

          <Text style={styles.switchLabel}>Expected Graduation Date</Text>
          <TextInput
            style={styles.input}
            placeholder="MM / YYYY"
            placeholderTextColor={colors.muted}
            value={graduationDate}
            onChangeText={(value) => { setGraduationDate(value); setError(''); }}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Create account" onPress={handleComplete} />
      </View>
    </View>
  );
}

export default IdentityProofingScreen;

const styles = StyleSheet.create({
  detailContent: {
    paddingBottom: 20,
  },
  infoPanel: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  switchLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingRow: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
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
