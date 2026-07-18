import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/constants';
import { copy } from '../theme/mockData';

export function CredentialCard({ compact = false }: { compact?: boolean }) {
  return (
    <LinearGradient
      colors={[colors.red, colors.redMid, colors.redDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.credentialCard, compact && styles.credentialCardCompact]}
    >
      <View style={styles.ringOne} />
      <View style={styles.ringTwo} />
      <View style={styles.ringThree} />
      <View style={styles.credentialTop}>
        <View style={styles.auSeal}>
          <Text style={styles.auSealText}>AU</Text>
        </View>
        <View style={styles.activePill}>
          <Text style={styles.activeDot}>●</Text>
          <Text style={styles.activeText}>ACTIVE</Text>
        </View>
      </View>
      <Text style={styles.cardEyebrow}>EDUCATION TRANSCRIPT · VC</Text>
      <Text style={styles.degree}>{copy.degree}</Text>
      <Text style={styles.major}>{copy.majorFull}</Text>
      <View style={styles.cardMetaRow}>
        <View>
          <Text style={styles.cardMetaLabel}>{compact ? 'Holder' : 'Issued by'}</Text>
          <Text style={styles.cardMetaValue}>{compact ? copy.studentDetail : 'Assumption University'}</Text>
        </View>
        <View style={styles.cardMetaRight}>
          <Text style={styles.cardMetaLabel}>{compact ? 'GPA' : 'Graduated'}</Text>
          <Text style={styles.cardMetaValue}>{compact ? copy.gpa : copy.graduationDisplay}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  credentialCard: {},
  credentialCardCompact: {},
  ringOne: {},
  ringTwo: {},
  ringThree: {},
  credentialTop: {},
  auSeal: {},
  auSealText: {},
  activePill: {},
  activeDot: {},
  activeText: {},
  cardEyebrow: {},
  degree: {},
  major: {},
  cardMetaRow: {},
  cardMetaLabel: {},
  cardMetaValue: {},
  cardMetaRight: {},
});