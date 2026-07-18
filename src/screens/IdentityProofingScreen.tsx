import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { BackHeader, PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { Screen } from '../types';

export function IdentityProofingScreen({ go }: { go: (screen: Screen) => void }) {
  const [passport, setPassport] = useState('');
  const [nationalId, setNationalId] = useState('');

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="Personal Details" subtitle="Step 3 of 3" onBack={() => go('identity_auth')} />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={[styles.infoPanel, { gap: 8 }]}>
          <Text style={styles.switchLabel}>Full Name (as per Passport)</Text>
          <View style={[styles.settingRow, { backgroundColor: colors.bg }]}><Text>Student</Text></View>

          <Text style={styles.switchLabel}>Passport Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter passport number"
            placeholderTextColor={colors.muted}
            value={passport}
            onChangeText={setPassport}
          />

          <Text style={styles.switchLabel}>National ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 13-digit ID"
            placeholderTextColor={colors.muted}
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="numeric"
            maxLength={13}
          />

          <Text style={styles.switchLabel}>Expected Graduation Date</Text>
          <View style={[styles.settingRow, { backgroundColor: colors.bg }]}><Text>Expected graduation date</Text></View>
        </View>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Submit to Registrar" onPress={() => go('verifying')} />
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
});
