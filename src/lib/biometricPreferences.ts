import * as SecureStore from 'expo-secure-store';

const memoryPreferences = new Map<string, boolean>();
const storageKey = (userId: string) => `auwallet.require-biometrics-before-sharing.${userId}`;

export async function loadRequireBiometrics(userId: string): Promise<boolean> {
  const key = storageKey(userId);
  if (!(await SecureStore.isAvailableAsync())) return memoryPreferences.get(key) ?? false;
  return (await SecureStore.getItemAsync(key)) === 'true';
}

export async function saveRequireBiometrics(userId: string, value: boolean): Promise<void> {
  const key = storageKey(userId);
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(key, String(value), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  memoryPreferences.set(key, value);
}
