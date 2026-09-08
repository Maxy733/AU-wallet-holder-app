import React, { useEffect, useRef, useState } from 'react';
import { InputAccessoryView, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../components';
import { verifyWalletPin } from '../lib/walletSecurity';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

const PIN_ACCESSORY_ID = 'unlock-pin-actions';

export function UnlockPinScreen({
  userId,
  purpose,
  onUnlocked,
  onSignOut,
}: {
  userId: string;
  purpose: 'wallet' | 'share';
  onUnlocked: () => void;
  onSignOut: () => void;
}) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);
  const actionLabel = loading ? 'Checking...' : purpose === 'share' ? 'Confirm PIN' : 'Unlock';

  useEffect(() => { inputRef.current?.focus(); }, []);

  const unlock = async (pinToVerify = pin) => {
    if (submittingRef.current || pinToVerify.length !== 6) return;

    submittingRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const valid = await verifyWalletPin(userId, pinToVerify);
      if (valid) {
        onUnlocked();
        return;
      }
      setError(true);
      setPin('');
      inputRef.current?.focus();
    } catch {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const updatePin = (value: string) => {
    const nextPin = value.replace(/\D/g, '').slice(0, 6);
    setError(false);
    setPin(nextPin);
    if (nextPin.length === 6) void unlock(nextPin);
  };

  return (
    <View style={themeStyles.screen}>
      <TextInput ref={inputRef} style={styles.hiddenInput} value={pin} onChangeText={updatePin} maxLength={6} keyboardType="number-pad" inputAccessoryViewID={Platform.OS === 'ios' ? PIN_ACCESSORY_ID : undefined} autoFocus />
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{purpose === 'share' ? 'Confirm before sharing' : 'Unlock your wallet'}</Text>
          <Text style={[styles.body, error && styles.error]}>{error ? 'Incorrect wallet PIN. Try again.' : 'Enter your six-digit wallet PIN.'}</Text>
          <Pressable style={styles.pinRow} onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={[styles.pinBox, error && styles.pinBoxError]}>{pin[index] ? <View style={styles.pinDot} /> : null}</View>
            ))}
          </Pressable>
        </View>
        {Platform.OS !== 'ios' ? (
          <View style={styles.actions}>
            <PrimaryButton label={actionLabel} onPress={unlock} disabled={loading || pin.length !== 6} />
            {purpose === 'wallet' ? <Pressable onPress={onSignOut}><Text style={styles.signOut}>Sign out</Text></Pressable> : null}
          </View>
        ) : null}
      </KeyboardAvoidingView>
      {Platform.OS === 'ios' ? (
        <InputAccessoryView nativeID={PIN_ACCESSORY_ID} backgroundColor={colors.bg}>
          <View style={styles.keyboardAccessory}>
            <PrimaryButton label={actionLabel} onPress={unlock} disabled={loading || pin.length !== 6} />
            {purpose === 'wallet' ? <Pressable onPress={onSignOut}><Text style={styles.signOut}>Sign out</Text></Pressable> : null}
          </View>
        </InputAccessoryView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  content: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  actions: { paddingHorizontal: 20, paddingBottom: 16 },
  keyboardAccessory: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: colors.bg },
  title: { color: colors.ink, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  body: { marginTop: 10, color: colors.muted, fontSize: 14, textAlign: 'center' },
  error: { color: colors.red },
  pinRow: { flexDirection: 'row', gap: 8, marginTop: 44 },
  pinBox: { width: 42, height: 52, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  pinBoxError: { borderColor: colors.red },
  pinDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: colors.ink },
  signOut: { color: colors.red, fontSize: 13, fontWeight: '700', textAlign: 'center', padding: 10 },
});
