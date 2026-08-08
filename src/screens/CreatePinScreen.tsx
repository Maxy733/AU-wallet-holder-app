import React, { useEffect, useRef, useState } from 'react';
import { InputAccessoryView, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';
import { Header, PrimaryButton } from '../components';

const PIN_ACCESSORY_ID = 'create-pin-actions';

export default function CreatePinScreen({
  onComplete,
}: {
  onComplete: (pin: string) => Promise<void>;
}) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePinChange = (text: string) => {
    setError(false);
    if (step === 'create') {
      setPin(text);
    } else {
      setConfirmPin(text);
    }
  };

  const handlePinPress = () => {
    if (inputRef.current?.isFocused()) {
      // If it thinks it's already focused, blur it and force a refocus
      inputRef.current.blur();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50); // A tiny 50ms delay gives the UI time to reset
    } else {
      // If it's not focused, just focus it normally
      inputRef.current?.focus();
    }
  };

  const handleNext = async () => {
    setError(false);
    if (step === 'create') {
      setStep('confirm');
    } else if (pin === confirmPin) {
      setSaving(true);
      try {
        await onComplete(pin);
      } finally {
        setSaving(false);
      }
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
  const actionLabel = saving ? 'Securing wallet...' : step === 'create' ? 'Create PIN' : 'Confirm PIN';

  return (
    <View style={themeStyles.screen}>
      <TextInput ref={inputRef} style={styles.pinInputHidden} value={currentPin} onChangeText={handlePinChange} maxLength={6} keyboardType="numeric" inputAccessoryViewID={Platform.OS === 'ios' ? PIN_ACCESSORY_ID : undefined} autoFocus />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header eyebrow="FINAL SETUP" title="Secure your wallet" showAvatar={false} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.detailContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeCopy}>
            <Text style={styles.welcomeTitle}>{title}</Text>
            <Text style={[styles.centerBody, error && { color: colors.red }]}>{subtitle}</Text>
          </View>
          <Pressable style={styles.pinContainer} onPress={handlePinPress}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={[styles.pinBox, error && { borderColor: colors.red }]}>
                {currentPin[i] ? <View style={styles.pinDot} /> : null}
              </View>
            ))}
          </Pressable>
        </ScrollView>
        {Platform.OS !== 'ios' ? (
          <View style={styles.actions}>
            <PrimaryButton
              label={actionLabel}
              onPress={handleNext}
              disabled={saving || currentPin.length !== 6}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={PIN_ACCESSORY_ID} backgroundColor={colors.bg}>
          <View style={styles.keyboardAccessory}>
            <PrimaryButton
              label={actionLabel}
              onPress={handleNext}
              disabled={saving || currentPin.length !== 6}
            />
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  scroll: { flex: 1 },
  pinInputHidden: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  detailContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  keyboardAccessory: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.bg,
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
