import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { StatusChrome } from '../components/StatusChrome';
import { BackHeader, FieldSwitch, InfoPanel, PrimaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Screen } from '../types';

type ShareFields = {
  degree: boolean;
  major: boolean;
  graduation: boolean;
  gpa: boolean;
  standing: boolean;
};

export function ShareScreen({
  fields,
  setFields,
  go,
  onShare,
}: {
  fields: ShareFields;
  setFields: React.Dispatch<React.SetStateAction<ShareFields>>;
  go: (screen: Screen) => void;
  onShare: () => void;
}) {
  const toggle = (key: keyof ShareFields) => setFields((current) => ({ ...current, [key]: !current[key] }));

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <BackHeader title="Share transcript proof" subtitle="Request from Employer A" onBack={() => go('credential')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themeStyles.detailContent}>
        <InfoPanel title="Requested fields">
          <FieldSwitch label="Degree name" code="degree_name" value={fields.degree} onPress={() => toggle('degree')} />
          <FieldSwitch label="Major" code="major" value={fields.major} onPress={() => toggle('major')} />
          <FieldSwitch label="Graduation date" code="graduation_date" value={fields.graduation} onPress={() => toggle('graduation')} />
          <FieldSwitch label="GPA" code="gpa" value={fields.gpa} onPress={() => toggle('gpa')} />
          <FieldSwitch label="Academic standing" code="academic_standing" value={fields.standing} onPress={() => toggle('standing')} last />
        </InfoPanel>
        <InfoPanel title="Share preview">
          <Text style={themeStyles.smallBody}>
            Only the fields switched on are included. GPA and academic standing stay hidden unless you turn them on.
          </Text>
        </InfoPanel>
        <View style={styles.toast}>
          <View style={styles.toastDot} />
          <Text style={styles.toastText}>Shared with Employer A · verified in &lt;1s</Text>
        </View>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Share proof" onPress={onShare} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
  },
  toastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green, marginRight: 12 },
  toastText: { color: 'white', fontSize: 13, fontWeight: '600' },
});