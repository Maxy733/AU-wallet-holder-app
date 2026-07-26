import React from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { Header, SectionLabel, SettingRow } from '../components';
import { BottomNav } from '../components/BottomNav';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function SettingsScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <Header eyebrow="Account" title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.scrollBottom}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}><Text style={styles.avatarText}>EC</Text></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Eric Criston</Text>
            <Text style={styles.profileMeta}>Student ID 6412345</Text>
          </View>
          <Text style={styles.schoolText}>Vicent Mary School of Engineering, Science and Technology</Text>
        </View>
        <SectionLabel>Security</SectionLabel>
        <SettingRow label="Require Face ID before sharing" toggleOn />
        <SectionLabel>Linked Issuers</SectionLabel>
        <SettingRow label="AU Registrar" />
        <SectionLabel>Account</SectionLabel>
        <SettingRow label="Revoke this device's key" danger />
        <Pressable style={styles.logoutButton} onPress={() => go('welcome')}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
      <BottomNav active="settings" go={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.red, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: 'white', fontSize: 20, fontWeight: '700' },
  profileInfo: {},
  profileName: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  profileMeta: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 2 },
  schoolText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  logoutButton: { marginHorizontal: 20, marginTop: 16, height: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.softRed, borderRadius: 16, borderWidth: 1, borderColor: '#F5D8D8' },
  logoutText: { color: colors.red, fontSize: 14, fontWeight: '700' },
});