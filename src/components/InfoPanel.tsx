import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles'; // <-- Import your centralized styles

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
    <View style={themeStyles.infoPanel}>
      <Text style={themeStyles.infoTitle}>{title}</Text>
      {rows?.map(([key, value]) => (
        <View style={themeStyles.infoRow} key={`${title}-${key}`}>
          <Text style={themeStyles.infoKey}>{key}</Text>
          <Text
            style={[
              themeStyles.infoValue,
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