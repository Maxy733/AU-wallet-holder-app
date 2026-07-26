import React from 'react';
import { View } from 'react-native';
import { Stat } from './Stat';
import { styles as themeStyles } from '../theme/styles';

export function SummaryStats() {
  return (
    <View style={themeStyles.summary}>
      <Stat value="1" label="Active VC" active />
      <Stat value="2" label="Pending" />
      <Stat value="<1s" label="Verify" />
    </View>
  );
}