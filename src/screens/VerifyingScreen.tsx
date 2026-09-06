import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function VerifyingScreen() {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Text style={[styles.welcomeTitle, { fontSize: 22 }]}>Accepting credential</Text>
        <Text style={[styles.centerBody, { marginBottom: 40 }]}>
          Confirming the pending AU Registrar offer and adding the issued credential to your wallet...
        </Text>
        <View style={styles.successHalo}>
          <View style={[styles.haloOuter, { backgroundColor: colors.sand }]} />
          <View style={[styles.haloMiddle, { backgroundColor: '#E8DBC9' }]} />
          <Animated.View style={[styles.haloCore, { backgroundColor: colors.brown, transform: [{ rotate: spin }] }]}>
            <Text style={{ fontSize: 32 }}>⏳</Text>
          </Animated.View>
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
