import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Header, PrimaryButton } from '../components';
import { StatusChrome } from '../components/StatusChrome';
import { Screen } from '../types';
import { FieldSwitch } from '../components/FieldSwitch';

export default function CreatePinScreen({ go }: { go: (screen: Screen) => void }) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(true);
  const inputRef = useRef<TextInput>(null);

  const handlePinChange = (text: string) => {
    setError(false);
    if (step === 'create') {
      setPin(text);
    } else {
      setConfirmPin(text);
    }
  };

  const handleNext = () => {
    setError(false);
    if (step === 'create') {
      setStep('confirm');
    } else if (pin === confirmPin) {
      go('identity_proofing');
    } else {
      setError(true);
      setTimeout(() => {
        setConfirmPin('');
        setError(false);
      }, 1000);
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;
  const title = step === 'create' ? 'Create Wallet PIN' : 'Confirm Wallet PIN';
  const subtitle = error ? 'PINs did not match. Try again.' : 'Set a local code to securely lock your credentials on this phone.';

  return (
    <View style={themeStyles.screen}>
      <StatusChrome />
      <TextInput ref={inputRef} style={styles.pinInputHidden} value={currentPin} onChangeText={handlePinChange} maxLength={6} keyboardType="numeric" autoFocus />
      <Header eyebrow="Step 1 of 3" title="Create Account" />
      <ScrollView contentContainerStyle={styles.detailContent}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeTitle}>{title}</Text>
          <Text style={[styles.centerBody, error && { color: colors.red }]}>{subtitle}</Text>
        </View>
        <Pressable style={styles.pinContainer} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.pinBox, error && { borderColor: colors.red }]}>
              {currentPin[i] && <View style={styles.pinDot} />}
            </View>
          ))}
        </Pressable>
        { <View style={{ marginHorizontal: 20, marginTop: 40 }}>
          <FieldSwitch label="Use Face ID" code="Enable biometrics for faster login" value={useBiometrics} onPress={() => setUseBiometrics(v => !v)} />
        </View> }
      </ScrollView>
      <View style={themeStyles.actionStack}>
        {step === 'create' && pin.length === 6 && (
          <PrimaryButton label="Create PIN" onPress={handleNext} />
        )}
        {step === 'confirm' && confirmPin.length === 6 && (
          <PrimaryButton label="Confirm PIN" onPress={handleNext} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    // ... existing styles if any, or new ones
  },
  pinInputHidden: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  detailContent: {
    paddingBottom: 20,
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
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 60,
  },
  pinBox: {
    width: 44,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ink,
  },
});
