import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/constants';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles'; // <-- Import your centralized styles

export function CredentialCard({ compact = false }: { compact?: boolean }) {
  return (
    <LinearGradient
      colors={[colors.red, colors.redMid, colors.redDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[themeStyles.credentialCard, compact && themeStyles.credentialCardCompact]}
    >
      <View style={themeStyles.ringOne} />
      <View style={themeStyles.ringTwo} />
      <View style={themeStyles.ringThree} />
      <View style={themeStyles.credentialTop}>
        <View style={themeStyles.auSeal}>
          <Text style={themeStyles.auSealText}>AU</Text>
        </View>
        <View style={themeStyles.activePill}>
          <Text style={themeStyles.activeDot}>●</Text>
          <Text style={themeStyles.activeText}>ACTIVE</Text>
        </View>
      </View>
      <Text style={themeStyles.cardEyebrow}>EDUCATION TRANSCRIPT · VC</Text>
      <Text style={themeStyles.degree}>{copy.degree}</Text>
      <Text style={themeStyles.major}>{copy.majorFull}</Text>
      <View style={themeStyles.cardMetaRow}>
        <View>
          <Text style={themeStyles.cardMetaLabel}>{compact ? 'Holder' : 'Issued by'}</Text>
          <Text style={themeStyles.cardMetaValue}>{compact ? copy.studentDetail : 'Assumption University'}</Text>
        </View>
        <View style={themeStyles.cardMetaRight}>
          <Text style={themeStyles.cardMetaLabel}>{compact ? 'GPA' : 'Graduated'}</Text>
          <Text style={themeStyles.cardMetaValue}>{compact ? copy.gpa : copy.graduationDisplay}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}