import React, { useRef, useState } from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ApplicantNationality, backendErrorMessage, BackendApiError, OnboardingRequest, walletApi } from '../api';
import { BackHeader, PrimaryButton, SecureTextInput } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

function formatDateOfBirth(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const minimumDateOfBirth = new Date(1900, 0, 1);
const maximumDateOfBirth = new Date();
const initialDateOfBirth = new Date(
  maximumDateOfBirth.getFullYear() - 18,
  maximumDateOfBirth.getMonth(),
  maximumDateOfBirth.getDate(),
);

export function IdentitySubmissionScreen({
  onSubmitted,
  onBack,
}: {
  onSubmitted: (request: OnboardingRequest, studentId: string) => void;
  onBack: () => void;
}) {
  const [admissionNo, setAdmissionNo] = useState('');
  const [selectedDateOfBirth, setSelectedDateOfBirth] = useState<Date | null>(null);
  const [pendingDateOfBirth, setPendingDateOfBirth] = useState(initialDateOfBirth);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nationality, setNationality] = useState<ApplicantNationality>('foreigner');
  const [documentNumber, setDocumentNumber] = useState('');
  const [showDocumentNumber, setShowDocumentNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const revealLastField = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);
  };

  const dateOfBirth = selectedDateOfBirth ? formatDateOfBirth(selectedDateOfBirth) : '';

  const openDatePicker = () => {
    Keyboard.dismiss();
    setPendingDateOfBirth(selectedDateOfBirth ?? initialDateOfBirth);
    setShowDatePicker(true);
    setErrorMessage(null);
  };

  const changeAndroidDate = (event: DateTimePickerEvent, value?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && value) {
      setSelectedDateOfBirth(value);
      setPendingDateOfBirth(value);
    }
  };

  const selectNationality = (value: ApplicantNationality) => {
    setNationality(value);
    setDocumentNumber('');
    setShowDocumentNumber(false);
    setErrorMessage(null);
  };

  const submit = async () => {
    setErrorMessage(null);
    if (!admissionNo.trim() || !selectedDateOfBirth) {
      setErrorMessage('Enter your admission number and select your date of birth.');
      return;
    }
    if (nationality === 'thai' && !/^\d{13}$/.test(documentNumber)) {
      setErrorMessage('Thai national ID must contain exactly 13 digits.');
      return;
    }
    if (nationality === 'foreigner' && !documentNumber.trim()) {
      setErrorMessage('Enter your passport number.');
      return;
    }

    setLoading(true);
    try {
      const request = await walletApi.submitOnboarding({
        admissionNo: admissionNo.trim(),
        dateOfBirth,
        nationality,
        ...(nationality === 'thai'
          ? { thaiNationalId: documentNumber }
          : { passportNumber: documentNumber.trim() }),
      });
      setDocumentNumber('');
      onSubmitted(request, admissionNo.trim());
    } catch (error) {
      if (error instanceof BackendApiError && error.code === 'ONBOARDING_REQUEST_ACTIVE') {
        setErrorMessage('An onboarding request is already active. Check its current status.');
      } else {
        setErrorMessage(backendErrorMessage(error, 'Could not submit your verification request.'));
      }
    } finally {
      // Identity document data remains only in the input while this screen is open.
      setDocumentNumber('');
      setLoading(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Connect Assumption University" subtitle="Student status verification" onBack={onBack} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Confirm you are an AU student</Text>
          <Text style={styles.body}>Select your nationality type and provide the minimum information needed for the mock Assumption University connection check.</Text>
          <View style={styles.panel}>
            <Text style={styles.label}>Nationality type</Text>
            <View accessibilityRole="radiogroup" style={styles.nationalityRow}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: nationality === 'thai' }}
                onPress={() => selectNationality('thai')}
                style={[styles.nationalityOption, nationality === 'thai' && styles.nationalityOptionSelected]}
              >
                <Text style={[styles.nationalityText, nationality === 'thai' && styles.nationalityTextSelected]}>Thai Nationality</Text>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: nationality === 'foreigner' }}
                onPress={() => selectNationality('foreigner')}
                style={[styles.nationalityOption, nationality === 'foreigner' && styles.nationalityOptionSelected]}
              >
                <Text style={[styles.nationalityText, nationality === 'foreigner' && styles.nationalityTextSelected]}>Foreigner</Text>
              </Pressable>
            </View>
            <Text style={styles.label}>Admission number</Text>
            <TextInput style={styles.input} value={admissionNo} onChangeText={setAdmissionNo} placeholder="Enter admission number" placeholderTextColor={colors.muted} autoCapitalize="characters" autoCorrect={false} />
            <Text style={styles.label}>Date of birth</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={dateOfBirth ? `Date of birth ${dateOfBirth}` : 'Select date of birth'}
              onPress={openDatePicker}
              style={({ pressed }) => [styles.dateInput, pressed && styles.dateInputPressed]}
            >
              <Text style={[styles.dateValue, !dateOfBirth && styles.datePlaceholder]}>
                {dateOfBirth || 'Select date of birth'}
              </Text>
              <Text style={styles.dateAction}>Choose</Text>
            </Pressable>
            {showDatePicker && Platform.OS === 'android' ? (
              <DateTimePicker
                value={pendingDateOfBirth}
                mode="date"
                display="calendar"
                minimumDate={minimumDateOfBirth}
                maximumDate={maximumDateOfBirth}
                onChange={changeAndroidDate}
              />
            ) : null}
            <Text style={styles.label}>{nationality === 'thai' ? 'Thai national ID' : 'Passport number'}</Text>
            <SecureTextInput
              fieldLabel={nationality === 'thai' ? 'Thai national ID' : 'passport number'}
              style={styles.input}
              value={documentNumber}
              onChangeText={(value) => {
                setErrorMessage(null);
                setDocumentNumber(nationality === 'thai' ? value.replace(/\D/g, '').slice(0, 13) : value);
              }}
              onFocus={revealLastField}
              placeholder={nationality === 'thai' ? 'Enter 13-digit ID number' : 'Enter passport number'}
              placeholderTextColor={colors.muted}
              keyboardType={nationality === 'thai' ? 'number-pad' : 'default'}
              maxLength={nationality === 'thai' ? 13 : 20}
              autoCapitalize={nationality === 'thai' ? 'none' : 'characters'}
              autoCorrect={false}
              visible={showDocumentNumber}
              onToggleVisibility={() => setShowDocumentNumber((current) => !current)}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
          <Text style={styles.privacy}>The wallet does not log or permanently store your {nationality === 'thai' ? 'Thai national ID' : 'passport number'}. It is discarded after submission.</Text>
          <PrimaryButton label={loading ? 'Submitting...' : 'Submit student verification'} onPress={submit} disabled={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={showDatePicker && Platform.OS === 'ios'}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.datePickerModal}>
            <Text style={styles.datePickerTitle}>Select date of birth</Text>
            <DateTimePicker
              style={styles.iosDatePicker}
              value={pendingDateOfBirth}
              mode="date"
              display="inline"
              minimumDate={minimumDateOfBirth}
              maximumDate={maximumDateOfBirth}
              onChange={(_event, value) => {
                if (value) setPendingDateOfBirth(value);
              }}
            />
            <View style={styles.datePickerActions}>
              <Pressable onPress={() => setShowDatePicker(false)} style={styles.datePickerButton}>
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectedDateOfBirth(pendingDateOfBirth);
                  setShowDatePicker(false);
                }}
                style={[styles.datePickerButton, styles.datePickerDoneButton]}
              >
                <Text style={styles.datePickerDone}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 60 },
  title: { color: colors.ink, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  body: { marginTop: 8, color: colors.muted, fontSize: 14, lineHeight: 21 },
  panel: { marginVertical: 22, padding: 18, gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.card },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 5 },
  nationalityRow: { flexDirection: 'row', gap: 8 },
  nationalityOption: { flex: 1, minHeight: 44, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  nationalityOptionSelected: { borderColor: colors.red, backgroundColor: colors.softRed },
  nationalityText: { color: colors.muted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  nationalityTextSelected: { color: colors.red },
  input: { height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.bg, color: colors.ink, fontSize: 15 },
  dateInput: { height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateInputPressed: { opacity: 0.7 },
  dateValue: { color: colors.ink, fontSize: 15 },
  datePlaceholder: { color: colors.muted },
  dateAction: { color: colors.red, fontSize: 12, fontWeight: '800' },
  modalBackdrop: { flex: 1, padding: 20, backgroundColor: 'rgba(28, 26, 23, 0.45)', alignItems: 'center', justifyContent: 'center' },
  datePickerModal: { width: '100%', maxWidth: 390, padding: 18, borderRadius: 22, backgroundColor: colors.card },
  datePickerTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  iosDatePicker: { width: '100%', height: 330 },
  datePickerActions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  datePickerButton: { minWidth: 82, height: 42, paddingHorizontal: 14, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  datePickerDoneButton: { backgroundColor: colors.red },
  datePickerCancel: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  datePickerDone: { color: colors.card, fontSize: 13, fontWeight: '800' },
  error: { color: colors.red, fontSize: 12.5, lineHeight: 18, marginTop: 5 },
  privacy: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginBottom: 18 },
});
