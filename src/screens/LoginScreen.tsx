import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BackHeader, PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { Screen } from '../types';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export default function LoginScreen({ go }: { go: (screen: Screen) => void }) {
  const handleLogin = () => {
    go('wallet');
  };

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="Login" subtitle="Step 4 of 4" onBack={() => go('wallet')} />
      <View style={styles.copy}>
        <Text style={styles.title}>Authenticate to finish setup</Text>
        <Text style={styles.body}>
          Confirm your account to unlock the wallet and complete the issuance flow.
        </Text>
      </View>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Login" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
