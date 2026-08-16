import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ProfilePreferenceDraft } from '../lib/profilePreferences';
import { BackHeader, PrimaryButton } from '../components';
import { colors } from '../theme/constants';
import { styles as themeStyles } from '../theme/styles';

export function EditProfileScreen({
  officialName,
  initialNickname,
  initialPhotoUri,
  onSave,
  onBack,
}: {
  officialName: string;
  initialNickname: string;
  initialPhotoUri: string | null;
  onSave: (draft: ProfilePreferenceDraft) => Promise<void>;
  onBack: () => void;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [photoUri, setPhotoUri] = useState<string | null>(initialPhotoUri);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initials = officialName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'AU';

  const choosePhoto = async () => {
    setErrorMessage(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage('Photo-library access is required to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setPhotoChanged(true);
    }
  };

  const save = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave({ nickname, photoUri, photoChanged });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save the profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={themeStyles.screen}>
      <BackHeader title="Edit profile" subtitle="Personal wallet appearance" onBack={onBack} />
      <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.photoSection}>
            <View style={styles.photoFrame}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
              ) : (
                <Text style={styles.initials}>{initials}</Text>
              )}
            </View>
            <View style={styles.photoActions}>
              <Pressable accessibilityRole="button" onPress={() => void choosePhoto()} style={styles.photoButton}>
                <Text style={styles.photoButtonText}>{photoUri ? 'Change photo' : 'Choose photo'}</Text>
              </Pressable>
              {photoUri ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setPhotoUri(null);
                    setPhotoChanged(true);
                  }}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <Text style={styles.label}>Nickname</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            maxLength={30}
            autoCapitalize="words"
            autoCorrect={false}
            placeholder={officialName}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.helper}>Your nickname appears only on the wallet home and Settings pages. Leave it blank to show your registered name.</Text>

          <View style={styles.officialPanel}>
            <Text style={styles.officialLabel}>REGISTERED NAME</Text>
            <Text style={styles.officialName}>{officialName}</Text>
            <Text style={styles.officialHelp}>Credential offers, official credentials, and issuer records continue to use this name.</Text>
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          <PrimaryButton label={saving ? 'Saving profile...' : 'Save changes'} onPress={() => void save()} disabled={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoider: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 44 },
  photoSection: { alignItems: 'center', marginTop: 10, marginBottom: 26 },
  photoFrame: { width: 104, height: 104, borderRadius: 52, overflow: 'hidden', backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  initials: { color: colors.card, fontSize: 34, fontWeight: '800' },
  photoActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  photoButton: { minHeight: 40, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.softRed, alignItems: 'center', justifyContent: 'center' },
  photoButtonText: { color: colors.red, fontSize: 12.5, fontWeight: '800' },
  removeButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { color: colors.muted, fontSize: 12.5, fontWeight: '700' },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: 8 },
  input: { height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.card, color: colors.ink, fontSize: 15 },
  helper: { marginTop: 8, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  officialPanel: { marginVertical: 22, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.card },
  officialLabel: { color: colors.muted, fontSize: 9.5, fontWeight: '800', letterSpacing: 1.1 },
  officialName: { marginTop: 6, color: colors.ink, fontSize: 16, fontWeight: '800' },
  officialHelp: { marginTop: 7, color: colors.muted, fontSize: 11.5, lineHeight: 17 },
  error: { marginBottom: 14, color: colors.red, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
});
