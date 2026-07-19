import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { PrimaryButton, SecondaryButton } from '../components';
import { BottomNav } from '../components/BottomNav';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function SuccessScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <View style={styles.simpleTop}>
        <Text style={styles.pageTitle}>Issuance Success</Text>
        <Pressable onPress={() => go('wallet')}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
      <View style={styles.successHalo}>
        <View style={styles.haloOuter} />
        <View style={styles.haloMiddle} />
        <View style={styles.haloCore}>
          <Text style={styles.check}>✓</Text>
        </View>
      </View>
      <Text style={styles.successTitle}>Pass Added!</Text>
      <Text style={styles.successCopy}>Your AU verified credential has been successfully stored in your wallet.</Text>
      <View style={styles.storedCard}>
        <View style={styles.cardLogo}><Text style={styles.cardLogoText}>AU</Text></View>
        <View style={styles.storedText}>
          <Text style={styles.storedIssuer}>AU Registrar</Text>
          <Text style={styles.storedTitle}>Education{'\n'}Transcript VC</Text>
          <Text style={styles.storedDesc}>Bachelor of Science</Text>
        </View>
        <View style={styles.verifiedPill}><Text style={styles.verifiedText}>✓ Verified</Text></View>
      </View>
      <View style={styles.successActions}>
        <PrimaryButton label="▣  View Pass" onPress={() => go('credential')} />
        // Change the Secondary Button or Done text to point to login
        <SecondaryButton label="Continue to Login" onPress={() => go('identity_auth')} />
      </View>
      <BottomNav active="wallet" go={go} />
    </View>
  );
}

const styles = StyleSheet.create({
  simpleTop: {
    height: 68,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  doneText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  successHalo: {
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloOuter: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: '#DDF7E9', // Hardcoded in original
  },
  haloMiddle: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#BDEED2', // Hardcoded in original
  },
  haloCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: colors.card,
    fontSize: 34,
    fontWeight: '800',
  },
  successTitle: {
    marginTop: 28,
    color: colors.blueInk,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  successCopy: {
    marginTop: 8,
    marginHorizontal: 54,
    color: colors.blueMuted,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  storedCard: {
    marginTop: 10,
    marginHorizontal: 20,
    height: 138,
    borderRadius: 22,
    backgroundColor: colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '800',
  },
  storedText: {
    marginLeft: 16,
    flex: 1,
  },
  storedIssuer: {
    color: colors.card,
    fontSize: 12,
    opacity: 0.85,
  },
  storedTitle: {
    marginTop: 4,
    color: colors.card,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  storedDesc: {
    marginTop: 2,
    color: colors.card,
    fontSize: 12,
    opacity: 0.9,
  },
  verifiedPill: {
    position: 'absolute',
    right: 22,
    top: 58,
    width: 82,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: colors.card,
    fontSize: 11,
    fontWeight: '600',
  },
  successActions: {
    marginTop: 18,
    marginHorizontal: 32,
    gap: 8,
  },
});