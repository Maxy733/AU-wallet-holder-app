import React, { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header, SectionLabel, SettingRow } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function SettingsScreen({
  go,
  onSignOut,
  onResetWallet,
  requireBiometrics,
  onToggleBiometrics,
  displayName,
  studentId,
  profilePhotoUri,
}: {
  go: (screen: Screen) => void;
  onSignOut: () => void;
  onResetWallet: () => Promise<void>;
  requireBiometrics: boolean;
  onToggleBiometrics: () => Promise<void>;
  displayName: string;
  studentId: string;
  profilePhotoUri: string | null;
}) {
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [biometricsBusy, setBiometricsBusy] = useState(false);
  const [biometricsError, setBiometricsError] = useState<string | null>(null);
  const toggleBiometrics = async () => {
    if (biometricsBusy) return;
    setBiometricsBusy(true);
    setBiometricsError(null);
    try {
      await onToggleBiometrics();
    } catch (error) {
      setBiometricsError(error instanceof Error ? error.message : 'Could not change biometric protection.');
    } finally {
      setBiometricsBusy(false);
    }
  };
  const performReset = async () => {
    setResetting(true);
    setResetError(null);
    try {
      await onResetWallet();
      go('wallet');
    } catch {
      setResetError('Could not remove credentials from this device. Please try again.');
    } finally {
      setResetting(false);
    }
  };
  const confirmReset = () => {
    if (resetting) return;
    const message = 'Remove all credentials stored in this wallet on this device? This cannot be undone and does not revoke credentials at the issuer.';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) void performReset();
      return;
    }
    Alert.alert('Reset Wallet', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset Wallet', style: 'destructive', onPress: () => void performReset() },
    ]);
  };
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'AU';

  return (
    <View style={themeStyles.screen}>
      <Header eyebrow="Account" title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit nickname and profile photo"
          onPress={() => go('edit_profile')}
          style={({ pressed }) => [styles.profileCard, pressed && styles.profileCardPressed]}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={styles.profilePhoto} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.profileMeta}>Student ID {studentId}</Text>
            </View>
            <View accessible accessibilityLabel="Assumption University verified" style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
              <Text style={styles.verifiedText}>AU verified</Text>
            </View>
          </View>
          <View style={styles.profileDivider} />
          <Text style={styles.facultyLabel}>FACULTY</Text>
          <Text style={styles.schoolText} numberOfLines={2}>Vincent Mary School of Engineering, Science and Technology</Text>
          <View style={styles.editProfileRow}>
            <Text style={styles.editProfileText}>Edit nickname and photo</Text>
            <Text style={styles.editProfileChevron}>›</Text>
          </View>
        </Pressable>
        <SectionLabel>Security</SectionLabel>
        <SettingRow
          label="Require Biometrics before sharing"
          toggleValue={Platform.OS === 'ios' ? false : requireBiometrics}
          onPress={() => void toggleBiometrics()}
          disabled={Platform.OS === 'ios'}
        />
        {Platform.OS === 'ios' ? <Text style={styles.comingSoon}>FaceID coming soon</Text> : null}
        {biometricsError ? <Text style={styles.resetError}>{biometricsError}</Text> : null}
        <SectionLabel>Linked Issuers</SectionLabel>
        <SettingRow label="AU Registrar" onPress={() => go('linked_issuer')} />
        <SectionLabel>Account</SectionLabel>
        <SettingRow label={resetting ? 'Resetting Wallet...' : 'Reset Wallet'} danger onPress={confirmReset} />
        {resetError ? <Text style={styles.resetError}>{resetError}</Text> : null}
        <Pressable style={styles.logoutButton} onPress={onSignOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileCardPressed: { opacity: 0.72 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.red, justifyContent: 'center', alignItems: 'center' },
  profilePhoto: { width: '100%', height: '100%' },
  avatarText: { color: colors.card, fontSize: 18, fontWeight: '800' },
  profileInfo: { flex: 1, minWidth: 0, marginLeft: 12, marginRight: 8 },
  profileName: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  profileMeta: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 3 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 26, borderRadius: 13, backgroundColor: '#E5F7EC' },
  verifiedIcon: { color: colors.green, fontSize: 10, fontWeight: '900' },
  verifiedText: { color: colors.green, fontSize: 9.5, fontWeight: '800' },
  profileDivider: { height: 1, marginVertical: 14, backgroundColor: colors.border },
  facultyLabel: { color: colors.muted, fontSize: 9.5, fontWeight: '700', letterSpacing: 1.1 },
  schoolText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 5,
  },
  editProfileRow: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editProfileText: { color: colors.red, fontSize: 11.5, fontWeight: '800' },
  editProfileChevron: { color: colors.red, fontSize: 17, fontWeight: '700' },
  logoutButton: { marginHorizontal: 20, marginTop: 16, height: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.softRed, borderRadius: 16, borderWidth: 1, borderColor: '#F5D8D8' },
  logoutText: { color: colors.red, fontSize: 14, fontWeight: '700' },
  resetError: { color: colors.red, fontSize: 12, marginHorizontal: 20, marginTop: 8 },
  comingSoon: { color: colors.muted, fontSize: 12, marginHorizontal: 20, marginTop: 8 },
});
