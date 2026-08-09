import * as SecureStore from 'expo-secure-store';

const LEGACY_SESSION_KEY = 'auwallet.backend.session.v1';
const SESSION_KEYS = {
  mock: 'wallet_session_mock',
  live: 'wallet_session_live',
} as const;

export type SessionStorageScope = keyof typeof SESSION_KEYS;

const memoryOnlySessions: Record<SessionStorageScope, StoredApiSession | null> = {
  mock: null,
  live: null,
};
let legacySessionCleared = false;

export type StoredApiSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

async function clearLegacySession() {
  if (legacySessionCleared || !(await SecureStore.isAvailableAsync())) return;
  await SecureStore.deleteItemAsync(LEGACY_SESSION_KEY);
  legacySessionCleared = true;
}

export async function saveApiSession(scope: SessionStorageScope, session: StoredApiSession) {
  if (!(await SecureStore.isAvailableAsync())) {
    memoryOnlySessions[scope] = session;
    return;
  }
  await clearLegacySession();
  await SecureStore.setItemAsync(SESSION_KEYS[scope], JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function readApiSession(scope: SessionStorageScope): Promise<StoredApiSession | null> {
  if (!(await SecureStore.isAvailableAsync())) return memoryOnlySessions[scope];
  await clearLegacySession();
  const serialized = await SecureStore.getItemAsync(SESSION_KEYS[scope]);
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized) as Partial<StoredApiSession>;
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      await clearApiSession(scope);
      return null;
    }
    return parsed as StoredApiSession;
  } catch {
    await clearApiSession(scope);
    return null;
  }
}

export async function clearApiSession(scope: SessionStorageScope) {
  memoryOnlySessions[scope] = null;
  if (!(await SecureStore.isAvailableAsync())) return;
  await clearLegacySession();
  await SecureStore.deleteItemAsync(SESSION_KEYS[scope]);
}
