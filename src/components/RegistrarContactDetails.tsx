import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';

export const registrarPhone = '+66 2783 2222';
export const registrarEmail = 'registrar@au.edu';

export async function openRegistrarContact(method: 'phone' | 'email') {
  const url = method === 'phone' ? 'tel:+6627832222' : `mailto:${registrarEmail}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open contact link', `You can copy the contact details and contact the registrar directly.\n\n${registrarPhone}\n${registrarEmail}`);
  }
}

export function RegistrarContactDetails() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Registrar office</Text>
      <Text style={styles.label}>Phone Number</Text>
      <Text selectable style={styles.value}>{registrarPhone}</Text>
      <Text style={styles.label}>Email Address</Text>
      <Text selectable style={styles.value}>{registrarEmail}</Text>
      <Pressable accessibilityRole="link" onPress={() => void openRegistrarContact('email')} style={styles.link}>
        <Text style={styles.linkText}>Email registrar ↗</Text>
      </Pressable>
      <Text style={styles.hint}>Select the phone number or email address to copy it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  title: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  label: { color: colors.muted, fontSize: 12, marginTop: 12, marginBottom: 6 },
  value: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  linkText: { color: colors.red, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
