import * as SecureStore from 'expo-secure-store';

const memoryReadNotificationIds = new Map<string, string[]>();
// Keep the original key so previously read offer notifications stay read.
const storageKey = (userId: string) => `auwallet.read-offer-notifications.${userId}`;

export async function loadReadNotificationIds(userId: string): Promise<string[]> {
  const key = storageKey(userId);
  const memoryIds = memoryReadNotificationIds.get(key);
  if (memoryIds) return memoryIds;
  const stored = (await SecureStore.isAvailableAsync())
    ? await SecureStore.getItemAsync(key)
    : null;
  if (!stored) return [];
  try {
    const ids: unknown = JSON.parse(stored);
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveReadNotificationIds(userId: string, ids: string[]): Promise<void> {
  const key = storageKey(userId);
  memoryReadNotificationIds.set(key, ids);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(key, JSON.stringify(ids), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

// The offers API has no revocation time, so retain when each was first detected.
const memoryRevocationTimes = new Map<string, Record<string, string>>();
const revocationTimesKey = (userId: string) => `auwallet.revocation-times.${userId}`;

export async function loadRevocationTimes(userId: string): Promise<Record<string, string>> {
  const key = revocationTimesKey(userId);
  const cached = memoryRevocationTimes.get(key);
  if (cached) return cached;
  const stored = (await SecureStore.isAvailableAsync()) ? await SecureStore.getItemAsync(key) : null;
  if (!stored) return {};
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) =>
      typeof value === 'string' && Number.isFinite(Date.parse(value)),
    )) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function saveRevocationTimes(userId: string, times: Record<string, string>): Promise<void> {
  const key = revocationTimesKey(userId);
  memoryRevocationTimes.set(key, times);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(key, JSON.stringify(times), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
