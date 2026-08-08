import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const pinKey = (userId: string) => `auwallet.pin.${userId}`;
const memoryOnlyVerifiers = new Map<string, string>();

async function hashPin(userId: string, pin: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${userId}:${pin}:auwallet-device-pin-v1`,
  );
}

export async function hasWalletPin(userId: string) {
  if (!(await SecureStore.isAvailableAsync())) return memoryOnlyVerifiers.has(pinKey(userId));
  return Boolean(await SecureStore.getItemAsync(pinKey(userId)));
}

export async function saveWalletPin(userId: string, pin: string) {
  const verifier = await hashPin(userId, pin);
  if (!(await SecureStore.isAvailableAsync())) {
    memoryOnlyVerifiers.set(pinKey(userId), verifier);
    return;
  }
  await SecureStore.setItemAsync(pinKey(userId), verifier, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function verifyWalletPin(userId: string, pin: string) {
  if (!(await SecureStore.isAvailableAsync())) {
    const verifier = memoryOnlyVerifiers.get(pinKey(userId));
    return Boolean(verifier) && verifier === await hashPin(userId, pin);
  }
  const storedVerifier = await SecureStore.getItemAsync(pinKey(userId));
  if (!storedVerifier) return false;
  return storedVerifier === await hashPin(userId, pin);
}
