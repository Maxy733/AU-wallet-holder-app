import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader, InfoPanel } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function LinkedIssuerScreen({
  officialName,
  studentId,
  confirmedAt,
  onBack,
}: {
  officialName: string;
  studentId: string;
  confirmedAt: string | null;
  onBack: () => void;
}) {
  const confirmedDate = confirmedAt
    ? new Date(confirmedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Confirmed';

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Linked issuer" subtitle="Assumption University" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.connectionCard}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/Assumption_University_of_Thailand_(logo).png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.issuerName}>AU Registrar</Text>
          <View accessible accessibilityLabel="Connected to Assumption University" style={styles.connectedBadge}>
            <Text style={styles.connectedIcon}>✓</Text>
            <Text style={styles.connectedText}>Connected to AU</Text>
          </View>
          <Text style={styles.body}>Your AU student identity has been matched and this wallet is enabled to receive credential offers from AU Registrar.</Text>
        </View>

        <InfoPanel
          title="Connection details"
          rows={[
            ['Status', 'Verified'],
            ['Official name', officialName],
            ['Student ID', studentId],
            ['Wallet access', 'Enabled'],
            ['Confirmed', confirmedDate],
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 44, gap: 14 },
  connectionCard: { padding: 22, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center' },
  logoFrame: { width: 82, height: 82, borderWidth: 1, borderColor: colors.border, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 70, height: 70 },
  issuerName: { marginTop: 14, color: colors.ink, fontSize: 20, fontWeight: '800' },
  connectedBadge: { marginTop: 10, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: '#E5F7EC', flexDirection: 'row', alignItems: 'center', gap: 5 },
  connectedIcon: { color: colors.green, fontSize: 11, fontWeight: '900' },
  connectedText: { color: colors.green, fontSize: 11.5, fontWeight: '800' },
  body: { marginTop: 14, color: colors.muted, fontSize: 12.5, lineHeight: 19, textAlign: 'center' },
});
