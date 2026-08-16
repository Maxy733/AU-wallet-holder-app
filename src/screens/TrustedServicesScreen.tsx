import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { IssuerProvider } from '../api';
import { BackHeader, IssuerProviderCard, SecondaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function TrustedServicesScreen({
  providers,
  loading,
  errorMessage,
  onRetry,
  onSelectIssuer,
  onBack,
}: {
  providers: IssuerProvider[];
  loading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onSelectIssuer: (provider: IssuerProvider) => void;
  onBack: () => void;
}) {
  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Issuer providers" subtitle="Available wallet connections" onBack={onBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose an issuer</Text>
        <Text style={styles.body}>
          Available providers can connect to your personal wallet. Coming-soon providers cannot connect yet.
        </Text>
        <View style={styles.list}>
          {loading ? (
            <View style={styles.messagePanel}>
              <ActivityIndicator size="small" color={colors.red} />
              <Text style={styles.message}>Loading issuer providers...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.messagePanel}>
              <Text style={styles.error}>{errorMessage}</Text>
              <SecondaryButton label="Try again" onPress={onRetry} />
            </View>
          ) : providers.length ? (
            providers.map((provider) => (
              <IssuerProviderCard key={provider.issuerCode} provider={provider} onPress={onSelectIssuer} />
            ))
          ) : (
            <Text style={styles.message}>No issuer providers are currently available.</Text>
          )}
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
  messagePanel: { padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center' },
  message: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  error: { color: colors.red, fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
