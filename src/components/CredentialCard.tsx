import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/constants';
import { copy } from '../theme/mockData';
import { styles as themeStyles } from '../theme/styles'; // <-- Import your centralized styles

const shortGraduationDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
    Number(month) - 1
  ];
  return monthName ? `${Number(day)} ${monthName} ${year}` : value;
};

export function CredentialCard({
  compact = false,
  holderName = 'Wallet holder',
  degree = copy.degree,
  major = copy.majorFull,
  gpa = copy.gpa,
  graduationDate = copy.graduationDisplay,
  issuerName = 'Assumption University',
}: {
  compact?: boolean;
  holderName?: string;
  degree?: string;
  major?: string;
  gpa?: string | number;
  graduationDate?: string;
  issuerName?: string;
}) {
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
      <Text style={themeStyles.degree}>{degree}</Text>
      <Text style={themeStyles.major}>{major}</Text>
      <View style={themeStyles.cardMetaRow}>
        <View>
          <Text style={themeStyles.cardMetaLabel}>{compact ? 'Holder' : 'Issued by'}</Text>
          <Text style={themeStyles.cardMetaValue}>{compact ? holderName : issuerName}</Text>
        </View>
        <View style={themeStyles.cardMetaRight}>
          <Text style={themeStyles.cardMetaLabel}>{compact ? 'GPA' : 'Graduated'}</Text>
          <Text style={themeStyles.cardMetaValue}>
            {compact ? String(gpa) : shortGraduationDate(graduationDate)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
