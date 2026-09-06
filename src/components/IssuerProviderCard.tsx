import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { IssuerProvider } from '../api';
import { getIssuerArtwork } from '../data/issuerArtwork';
import { colors } from '../theme/constants';

function providerAction(provider: IssuerProvider) {
  if (provider.availability === 'coming_soon') {
    return { label: 'Coming soon', color: colors.muted, disabled: true };
  }
  if (!provider.connectionEnabled) {
    return { label: 'Unavailable', color: colors.muted, disabled: true };
  }

  switch (provider.connectionStatus) {
    case 'pending_verification':
      return { label: 'Review status', color: colors.brown, disabled: false };
    case 'verified':
      return { label: 'Connected', color: colors.green, disabled: true };
    case 'rejected':
      return { label: 'Try again', color: colors.red, disabled: false };
    case 'disconnected':
    default:
      return { label: 'Connect', color: colors.red, disabled: false };
  }
}

export function IssuerProviderCard({
  provider,
  onPress,
}: {
  provider: IssuerProvider;
  onPress: (provider: IssuerProvider) => void;
}) {
  const artwork = getIssuerArtwork(provider.issuerCode, provider.displayName);
  const action = providerAction(provider);
  const mockLabel = provider.issuerCode === 'assumption-university' ? 'Mock' : 'Prototype';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${action.label} ${provider.displayName}`}
      accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled}
      onPress={() => onPress(provider)}
      style={({ pressed }) => [styles.card, action.disabled && styles.disabledCard, pressed && styles.pressed]}
    >
      <View style={[styles.logo, artwork.image ? styles.imageLogo : null]}>
        {artwork.image ? (
          <Image source={artwork.image} style={styles.logoImage} resizeMode={artwork.resizeMode ?? 'contain'} />
        ) : (
          <Text style={styles.logoText}>{artwork.initials}</Text>
        )}
      </View>
      <View style={styles.providerText}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{provider.displayName}</Text>
          {provider.isMock ? <Text style={styles.mockLabel}>{mockLabel}</Text> : null}
        </View>
        <Text style={styles.description}>{provider.description}</Text>
      </View>
      <View style={[styles.action, { borderColor: action.color }]}>
        <Text style={[styles.actionText, { color: action.color }]}>{action.label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 76, marginBottom: 10, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center' },
  disabledCard: { opacity: 0.72 },
  pressed: { opacity: 0.68 },
  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  imageLogo: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  logoImage: { width: 38, height: 38 },
  logoText: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  providerText: { flex: 1, marginLeft: 12, marginRight: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  name: { color: colors.ink, fontSize: 13.5, fontWeight: '700' },
  mockLabel: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.sand, color: colors.brown, fontSize: 8.5, fontWeight: '800' },
  description: { marginTop: 4, color: colors.muted, fontSize: 10.5, lineHeight: 14 },
  action: { minWidth: 76, minHeight: 30, maxWidth: 92, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 10.5, fontWeight: '800', textAlign: 'center' },
});
