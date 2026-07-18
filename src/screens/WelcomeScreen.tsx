import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { PrimaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function WelcomeScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <View style={styles.logoGlow} />
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/Assumption_University_of_Thailand_(logo).png')} style={styles.welcomeLogo} />
      </View>
      <View style={styles.welcomeCopy}>
        <Text style={styles.welcomeTitle}>AU Wallet</Text>
        <Text style={[styles.eyebrowCentered, { marginTop: 4 }]}>ASSUMPTION UNIVERSITY</Text>
        <Text style={styles.centerBody}>
          Securely receive, store, and share verified university certificates.
        </Text>
      </View>
      <View style={styles.loginPanel}>
        <Text style={styles.panelHeading}>Continue as student</Text>
        <PrimaryButton label="Sign in with AU Account" onPress={onSignIn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoGlow: {
    position: 'absolute',
    top: 50,
    right: -71,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.softRed,
    opacity: 0.85,
  },
  logoContainer: {
    marginTop: 5,
    marginHorizontal: 9,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  welcomeCopy: {
    marginTop: -12,
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  welcomeTitle: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  eyebrowCentered: {
    color: colors.red,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.1,
    textAlign: 'center',
  },
  centerBody: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  loginPanel: {
    marginTop: 100,
    marginHorizontal: 20,
    padding: 20,
    height: 140,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    shadowColor: '#1C1A17',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 6,
    justifyContent: 'space-between',
  },
  panelHeading: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
});