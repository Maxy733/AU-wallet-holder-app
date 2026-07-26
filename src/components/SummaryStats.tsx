import React from 'react';
import { View } from 'react-native';
import { Stat } from './Stat';
import { styles as themeStyles } from '../theme/styles';

export function SummaryStats({ hasCredential }: { hasCredential: boolean }) {
  return (
    <View style={themeStyles.summary}>
      <Stat value={hasCredential ? '1' : '0'} label="Active VC" active />
      <Stat value="1" label="Pending" />
      <Stat value="10s" label="Verify" />
    </View>
  );
}
