import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { Screen } from '../types';

export default function CreatePinScreen({ go }: { go: (screen: Screen) => void }) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePinChange = (text: string) => {
    setError(false);
    if (step === 'create') {
      setPin(text);
    } else {
      setConfirmPin(text);
      if (text.length === 6) {
        if (pin !== text) {
          setError(true);
          setTimeout(() => {
            setPin('');
            setConfirmPin('');
            setStep('create');
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleNext = () => {
    setError(false);
    if (currentPin.length !== 6) {
      setError(true);
      return;
    }
    if (step === 'create') {
      setStep('confirm');
    } else if (pin === confirmPin) {
      go('identity_auth');
    } else {
      setError(true);
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;
  const title = step === 'create' ? 'Create Wallet PIN' : 'Confirm Wallet PIN';
  const subtitle = error
    ? currentPin.length !== 6
      ? 'Enter all 6 digits to continue.'
      : 'PINs did not match. Try again.'
    : 'Set a local code to securely lock your credentials on this phone.';

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <TextInput ref={inputRef} style={styles.pinInputHidden} value={currentPin} onChangeText={handlePinChange} maxLength={6} keyboardType="number-pad" autoFocus />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STEP 1 OF 3</Text>
        <Text style={styles.headerTitle}>Create account</Text>
      </View>
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeTitle}>{title}</Text>
          <Text style={[styles.centerBody, error && { color: colors.red }]}>{subtitle}</Text>
        </View>
        <Pressable style={styles.pinRow} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.pinBox, error && styles.pinBoxError]}>
              {currentPin[i] && <View style={styles.pinDot} />}
            </View>
          ))}
        </Pressable>
      </ScrollView>
      <View style={themeStyles.actionStack}>
        <PrimaryButton label={step === 'create' ? 'Create PIN' : 'Confirm PIN'} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
  },
  headerTitle: {
    marginTop: 3,
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  pinInputHidden: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  detailContent: {
    paddingBottom: 120,
  },
  welcomeCopy: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  welcomeTitle: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  centerBody: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  pinBox: {
    width: 42,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 60,
  },
  pinBoxError: {
    borderColor: colors.red,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ink,
  },
});
