import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'auwallet.backend.session.v1';
let memoryOnlySession: StoredApiSession | null = null;

export type StoredApiSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export async function saveApiSession(session: StoredApiSession) {
  if (!(await SecureStore.isAvailableAsync())) {
    memoryOnlySession = session;
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function readApiSession(): Promise<StoredApiSession | null> {
  if (!(await SecureStore.isAvailableAsync())) return memoryOnlySession;
  const serialized = await SecureStore.getItemAsync(SESSION_KEY);
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized) as Partial<StoredApiSession>;
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      await clearApiSession();
      return null;
    }
    return parsed as StoredApiSession;
  } catch {
    await clearApiSession();
    return null;
  }
}

export async function clearApiSession() {
  memoryOnlySession = null;
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
