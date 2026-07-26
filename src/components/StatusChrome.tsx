import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';

export function StatusChrome() {
  return (
    <View style={styles.status}>
      <Text style={styles.statusText}>9:41</Text>
      <View style={styles.rightStatus}>
        <Text style={styles.signal}>▮▮▮</Text>
        <View style={styles.battery}>
          <View style={styles.batteryInner}>
            <View style={styles.batteryCharge} />
          </View>
          <View style={styles.batteryTerminal} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    height: 44,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  rightStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  signal: {
    color: colors.ink,
    fontSize: 7,
    letterSpacing: 1,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryInner: {
    width: 20,
    height: 9,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 2.5,
    padding: 1,
  },
  batteryCharge: {
    width: '70%',
    height: '100%',
    backgroundColor: colors.ink,
    borderRadius: 1,
  },
  batteryTerminal: {
    width: 1,
    height: 4,
    backgroundColor: colors.ink,
    marginLeft: 1,
  },
});
