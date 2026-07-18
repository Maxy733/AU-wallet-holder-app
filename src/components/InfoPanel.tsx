import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/constants';

export function InfoPanel({
  title,
  rows,
  children,
}: {
  title: string;
  rows?: Array<[string, string]>;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.infoTitle}>{title}</Text>
      {rows?.map(([key, value]) => (
        <View style={styles.infoRow} key={`${title}-${key}`}>
          <Text style={styles.infoKey}>{key}</Text>
          <Text
            style={[
              styles.infoValue,
              value === 'Active' && { color: colors.green },
              value === 'Hidden' && { color: colors.hidden },
            ]}
          >
            {value}
          </Text>
        </View>
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  infoPanel: {},
  infoTitle: {},
  infoRow: {},
  infoKey: {},
  infoValue: {},
});