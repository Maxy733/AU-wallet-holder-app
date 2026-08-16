import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';

export type ProfilePreferences = {
  nickname: string;
  photoUri: string | null;
};

export type ProfilePreferenceDraft = {
  nickname: string;
  photoUri: string | null;
  photoChanged: boolean;
};

const memoryOnlyProfiles = new Map<string, ProfilePreferences>();
const emptyProfile: ProfilePreferences = { nickname: '', photoUri: null };

const profileKey = (userId: string) => `auwallet.profile.${userId}`;

function normalizeProfile(value: unknown): ProfilePreferences {
  if (!value || typeof value !== 'object') return { ...emptyProfile };
  const candidate = value as Partial<ProfilePreferences>;
  return {
    nickname: typeof candidate.nickname === 'string' ? candidate.nickname.slice(0, 30) : '',
    photoUri: typeof candidate.photoUri === 'string' ? candidate.photoUri : null,
  };
}

async function writeProfilePreferences(userId: string, preferences: ProfilePreferences) {
  memoryOnlyProfiles.set(profileKey(userId), preferences);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(profileKey(userId), JSON.stringify(preferences), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadProfilePreferences(userId: string): Promise<ProfilePreferences> {
  if (!(await SecureStore.isAvailableAsync())) {
    return memoryOnlyProfiles.get(profileKey(userId)) ?? { ...emptyProfile };
  }

  const serialized = await SecureStore.getItemAsync(profileKey(userId));
  if (!serialized) return { ...emptyProfile };

  try {
    return normalizeProfile(JSON.parse(serialized));
  } catch {
    return { ...emptyProfile };
  }
}

function managedPhotoUri(userId: string, sourceUri: string) {
  if (!FileSystem.documentDirectory) return sourceUri;
  const safeUserId = userId.replace(/[^a-z0-9_-]/gi, '_');
  const extensionMatch = sourceUri.match(/\.([a-z0-9]{2,5})(?:\?|$)/i);
  const extension = extensionMatch?.[1]?.toLowerCase() ?? 'jpg';
  return `${FileSystem.documentDirectory}profile-${safeUserId}-${Date.now()}.${extension}`;
}

function isManagedPhoto(uri: string | null) {
  return Boolean(uri && FileSystem.documentDirectory && uri.startsWith(FileSystem.documentDirectory));
}

export async function saveProfilePreferences(
  userId: string,
  draft: ProfilePreferenceDraft,
): Promise<ProfilePreferences> {
  const previous = await loadProfilePreferences(userId);
  let nextPhotoUri = previous.photoUri;

  if (draft.photoChanged) {
    if (draft.photoUri) {
      const destination = managedPhotoUri(userId, draft.photoUri);
      if (destination !== draft.photoUri) {
        await FileSystem.copyAsync({ from: draft.photoUri, to: destination });
      }
      nextPhotoUri = destination;
    } else {
      nextPhotoUri = null;
    }
  }

  const next: ProfilePreferences = {
    nickname: draft.nickname.trim().slice(0, 30),
    photoUri: nextPhotoUri,
  };
  await writeProfilePreferences(userId, next);

  if (previous.photoUri !== next.photoUri && isManagedPhoto(previous.photoUri)) {
    await FileSystem.deleteAsync(previous.photoUri as string, { idempotent: true }).catch(() => undefined);
  }

  return next;
}
