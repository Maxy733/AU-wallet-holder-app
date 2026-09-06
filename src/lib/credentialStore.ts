import * as SecureStore from 'expo-secure-store';

import type { IssuedCredential } from '../api/types';

const memoryOnlyCredentials = new Map<string, IssuedCredential>();

const credentialStorageKey = (userId: string) => `auwallet.issued-credential.${userId}`;

export async function saveIssuedCredential(userId: string, credential: IssuedCredential) {
  const storageKey = credentialStorageKey(userId);
  memoryOnlyCredentials.set(storageKey, credential);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(storageKey, JSON.stringify(credential), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadIssuedCredential(userId: string): Promise<IssuedCredential | null> {
  const storageKey = credentialStorageKey(userId);
  const memoryCredential = memoryOnlyCredentials.get(storageKey);
  const serialized = (await SecureStore.isAvailableAsync())
    ? await SecureStore.getItemAsync(storageKey)
    : memoryCredential ? JSON.stringify(memoryCredential) : null;
  if (!serialized) return null;

  try {
    const credential = JSON.parse(serialized) as Partial<IssuedCredential>;
    if (
      typeof credential.credential !== 'string' ||
      credential.format !== 'dc+sd-jwt' ||
      typeof credential.offerId !== 'string' ||
      credential.status !== 'issued' ||
      typeof credential.issuedAt !== 'string' ||
      typeof credential.credentialId !== 'string'
    ) {
      return null;
    }
    return credential as IssuedCredential;
  } catch {
    return null;
  }
}
