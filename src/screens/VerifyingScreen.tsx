import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { PrimaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

export function VerifyingScreen({ go }: { go: (screen: Screen) => void }) {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Text style={[styles.welcomeTitle, { fontSize: 22 }]}>Verification in Progress</Text>
        <Text style={[styles.centerBody, { marginBottom: 40 }]}>
          Assumption University systems are cross-referencing your submitted documentation...
        </Text>
        <View style={styles.successHalo}>
          <View style={[styles.haloOuter, { backgroundColor: colors.sand }]} />
          <View style={[styles.haloMiddle, { backgroundColor: '#E8DBC9' }]} />
          <Animated.View style={[styles.haloCore, { backgroundColor: colors.brown, transform: [{ rotate: spin }] }]}>
            <Text style={{ fontSize: 32 }}>⏳</Text>
          </Animated.View>
        </View>
        <View style={themeStyles.actionStack}>
          <PrimaryButton label="Return" onPress={() => go('welcome')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeTitle: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  centerBody: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
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
  },
  haloMiddle: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  haloCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: colors.card,
    fontSize: 34,
    fontWeight: '800',
  },
});