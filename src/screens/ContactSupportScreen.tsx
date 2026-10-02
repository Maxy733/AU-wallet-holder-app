import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { PrimaryButton } from '../components/PrimaryButton';
import { BackHeader } from '../components/BackHeader';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import type { Screen } from '../types';

const reasons = [
  'Revoked in Error',
  'Correction of academic information',
  'Updated identity documents',
  'Revocation issue resolved',
  'Other',
];
type Attachment = DocumentPicker.DocumentPickerAsset;
type FieldErrors = Partial<Record<'reason' | 'explanation' | 'identity' | 'academic' | 'email' | 'certified', string>>;

export function ContactSupportScreen({ go, notificationEmail = '' }: {
  go: (screen: Screen) => void;
  notificationEmail?: string;
}) {
  const [reason, setReason] = useState('');
  const [showReasons, setShowReasons] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [identityDocument, setIdentityDocument] = useState<Attachment | null>(null);
  const [academicDocument, setAcademicDocument] = useState<Attachment | null>(null);
  const [email, setEmail] = useState(notificationEmail);
  const [certified, setCertified] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const pickDocument = async (kind: 'identity' | 'academic') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: kind === 'identity' ? 'image/*' : 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
        base64: false,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file) return;
      const validType = kind === 'identity'
        ? (file.mimeType ? file.mimeType.startsWith('image/') : /\.(jpe?g|png|heic|heif|webp|gif|bmp|tiff?)$/i.test(file.name))
        : (file.mimeType === 'application/pdf' || (!file.mimeType && /\.pdf$/i.test(file.name)));
      if (!validType) {
        setErrors((current) => ({ ...current, [kind]: kind === 'identity' ? 'Select an image of your Student ID or passport.' : 'Select a PDF of your academic proof or petition.' }));
        return;
      }
      if (kind === 'identity') setIdentityDocument(file);
      else setAcademicDocument(file);
      clearError(kind);
    } catch {
      setErrors((current) => ({ ...current, [kind]: 'Could not select this document. Please try again.' }));
    }
  };

  const submit = () => {
    const nextErrors: FieldErrors = {};
    if (!reason) nextErrors.reason = 'Select a reason for re-application.';
    if (!explanation.trim()) nextErrors.explanation = 'Write a brief explanation.';
    if (!identityDocument) nextErrors.identity = 'Attach your Student ID or passport image.';
    if (!academicDocument) nextErrors.academic = 'Attach your academic proof or petition PDF.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!certified) nextErrors.certified = 'Certify that the information is accurate.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    go('wallet');
  };

  const uploadField = (kind: 'identity' | 'academic', file: Attachment | null, label: string) => (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={file ? `Replace ${file.name}` : label}
        onPress={() => void pickDocument(kind)}
        style={({ pressed }) => [styles.upload, errors[kind] && styles.invalid, pressed && styles.pressed]}
      >
        <Text style={styles.uploadIcon}>{file ? '✓' : '+'}</Text>
        <View style={styles.uploadCopy}>
          <Text style={styles.uploadLabel}>{label}</Text>
          {file ? <Text numberOfLines={2} style={styles.fileName}>{file.name} · Tap to replace</Text> : null}
        </View>
      </Pressable>
      {file ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${file.name}`} onPress={() => {
          if (kind === 'identity') setIdentityDocument(null);
          else setAcademicDocument(null);
        }} style={styles.remove}>
          <Text style={styles.removeText}>Remove document</Text>
        </Pressable>
      ) : null}
      {errors[kind] ? <Text accessibilityRole="alert" style={styles.error}>{errors[kind]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={themeStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader title="Contact support" subtitle="Education Transcript VC" onBack={() => go('revoked_vc')} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View style={styles.icon}><Text style={styles.iconText}>↻</Text></View>
          <Text accessibilityRole="header" style={styles.title}>Reapply for Credential</Text>
          <Text style={styles.subtitle}>Submit a request to re-issue your Education Transcript VC.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Target Credential</Text>
          <View style={styles.credential}>
            <Text style={styles.credentialName}>Education Transcript VC</Text>
            <Text style={styles.revoked}>• Status: Revoked</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Reason for Re-application <Text style={styles.required}>*</Text></Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Reason for Re-application, required" accessibilityState={{ expanded: showReasons }} onPress={() => setShowReasons(true)} style={[styles.input, styles.select, errors.reason && styles.invalid]}>
              <Text style={[styles.inputText, !reason && styles.placeholder]}>{reason || 'Select a reason...'}</Text>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>
            {errors.reason ? <Text accessibilityRole="alert" style={styles.error}>{errors.reason}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Explanation <Text style={styles.required}>*</Text></Text>
            <TextInput
              accessibilityLabel="Explanation, required"
              value={explanation}
              onChangeText={(value) => { setExplanation(value); clearError('explanation'); }}
              placeholder="Write a brief explanation here..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.explanation, errors.explanation && styles.invalid]}
            />
            {errors.explanation ? <Text accessibilityRole="alert" style={styles.error}>{errors.explanation}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Supporting Documents <Text style={styles.required}>*</Text></Text>
            {uploadField('identity', identityDocument, 'Upload Student ID / Passport (Image)')}
            {uploadField('academic', academicDocument, 'Upload Academic Proof / Petition (PDF)')}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notification Email</Text>
            <TextInput
              accessibilityLabel="Notification Email"
              value={email}
              onChangeText={(value) => { setEmail(value); clearError('email'); }}
              placeholder="u661xxxx@au.edu"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={[styles.input, errors.email && styles.invalid]}
            />
            {errors.email ? <Text accessibilityRole="alert" style={styles.error}>{errors.email}</Text> : null}
          </View>

          <View>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: certified }} accessibilityLabel="I certify the above information is accurate" onPress={() => { setCertified(!certified); clearError('certified'); }} style={styles.certification}>
              <View style={[styles.checkbox, certified && styles.checked, errors.certified && styles.invalid]}>
                {certified ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.certificationText}>I certify the above information is accurate.</Text>
            </Pressable>
            {errors.certified ? <Text accessibilityRole="alert" style={styles.error}>{errors.certified}</Text> : null}
          </View>

        </View>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label="Submit Re-application" onPress={submit} />
      </View>

      <Modal visible={showReasons} transparent animationType="fade" onRequestClose={() => setShowReasons(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close reason selection" onPress={() => setShowReasons(false)} style={StyleSheet.absoluteFillObject} />
          <View accessibilityViewIsModal style={styles.modalCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>Reason for Re-application</Text>
            {reasons.map((option) => (
              <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: reason === option }} onPress={() => { setReason(option); clearError('reason'); setShowReasons(false); }} style={styles.option}>
                <Text style={[styles.optionText, reason === option && styles.selectedOption]}>{option}</Text>
                {reason === option ? <Text style={styles.selectedOption}>✓</Text> : null}
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" onPress={() => setShowReasons(false)} style={styles.option}>
              <Text style={styles.selectedOption}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120, gap: 20 },
  heading: { padding: 22, borderRadius: 22, backgroundColor: colors.softRed, alignItems: 'center' },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  iconText: { color: colors.red, fontSize: 32, fontWeight: '800' },
  title: { color: colors.redDark, fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 12, textAlign: 'center' },
  card: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  formCard: { padding: 20, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 20 },
  field: { gap: 10 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  required: { color: colors.red },
  credential: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  credentialName: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  revoked: { color: colors.red, fontSize: 14, fontWeight: '600' },
  input: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card, color: colors.ink, fontSize: 14 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  inputText: { flex: 1, color: colors.ink, fontSize: 14 },
  placeholder: { color: colors.muted },
  chevron: { color: colors.muted, fontSize: 22 },
  explanation: { minHeight: 120, lineHeight: 21 },
  upload: { minHeight: 76, padding: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.hidden, borderRadius: 14, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 12 },
  uploadIcon: { color: colors.red, fontSize: 25, fontWeight: '600' },
  uploadCopy: { flex: 1, gap: 5 },
  uploadLabel: { color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  fileName: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.7 },
  remove: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  removeText: { color: colors.red, fontSize: 12, fontWeight: '600' },
  certification: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: colors.hidden, borderRadius: 6, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.red, borderColor: colors.red },
  checkmark: { color: colors.card, fontSize: 16, fontWeight: '800' },
  certificationText: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 20 },
  invalid: { borderColor: colors.red },
  error: { color: colors.red, fontSize: 12, lineHeight: 18 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(28,25,24,0.4)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20 },
  modalTitle: { color: colors.ink, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  option: { minHeight: 52, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: colors.border },
  optionText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 20 },
  selectedOption: { color: colors.red, fontWeight: '700' },
});
