import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function StatusChrome() {
  return (
    <View style={styles.status}>
      <Text style={styles.statusText}>9:41</Text>
      <View style={styles.battery}>
        <View style={styles.batteryInner}>
          <View style={styles.batteryCharge} />
        </View>
        <View style={styles.batteryTerminal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // TODO: Move status, statusText, battery, batteryInner, batteryCharge, and batteryTerminal styles here
  status: {},
  statusText: {},
  battery: {},
  batteryInner: {},
  batteryCharge: {},
  batteryTerminal: {},
});