import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackHeader } from '../components';
import { mockTrustedServices } from '../data/trustedServices';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function TrustedServicesScreen({ onBack }: { onBack: () => void }) {
  const openMockProvider = (providerName: string) => {
    Alert.alert(
      'Mock provider',
      `${providerName} is shown for demonstration only. No connection or data exchange will occur.`,
    );
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="More trusted services" subtitle="Available mock providers" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Explore other services</Text>
        <Text style={styles.body}>
          These providers are mock examples. They do not connect to a real university or exchange personal data.
        </Text>
        <View style={styles.list}>
          {mockTrustedServices.map((provider) => (
            <Pressable
              key={provider.id}
              accessibilityRole="button"
              accessibilityLabel={`Open mock provider ${provider.name}`}
              onPress={() => openMockProvider(provider.name)}
              style={({ pressed }) => [styles.serviceCard, pressed && styles.servicePressed]}
            >
              <View style={styles.serviceLogo}><Text style={styles.logoText}>{provider.initials}</Text></View>
              <View style={styles.serviceText}>
                <Text style={styles.serviceName}>{provider.name}</Text>
                <Text style={styles.serviceDetail}>{provider.detail}</Text>
              </View>
              <View style={styles.mockPill}><Text style={styles.mockPillText}>Mock</Text></View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  title: { color: colors.ink, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  body: { marginTop: 8, color: colors.muted, fontSize: 14, lineHeight: 21 },
  list: { marginTop: 22 },
  serviceCard: { minHeight: 76, marginBottom: 12, padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center' },
  servicePressed: { opacity: 0.68 },
  serviceLogo: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  serviceText: { flex: 1, marginLeft: 12, marginRight: 8 },
  serviceName: { color: colors.ink, fontSize: 13.5, fontWeight: '700' },
  serviceDetail: { marginTop: 4, color: colors.muted, fontSize: 10.5, lineHeight: 14 },
  mockPill: { height: 27, paddingHorizontal: 10, borderRadius: 14, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  mockPillText: { color: colors.brown, fontSize: 10, fontWeight: '800' },
});
