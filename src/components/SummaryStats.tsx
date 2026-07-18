import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stat } from './Stat';

export function SummaryStats() {
  return (
    <View style={styles.summary}>
      <Stat value="1" label="Active VC" active />
      <Stat value="2" label="Pending" />
      <Stat value="<1s" label="Verify" />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {},
});