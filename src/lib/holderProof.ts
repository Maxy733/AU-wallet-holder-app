import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { p256 } from '@noble/curves/nist.js';

type PublicP256Jwk = {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
};

type HolderProofInput = {
  userId: string;
  credentialIssuer: string | undefined;
  nonce: string | undefined;
};

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const memoryOnlyPrivateKeys = new Map<string, string>();

const holderKeyStorageKey = (userId: string) => `auwallet.holder-es256.${userId}`;

function toBase64Url(bytes: Uint8Array): string {
  let encoded = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    encoded += base64Alphabet[first >> 2];
    encoded += base64Alphabet[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
    if (second !== undefined) encoded += base64Alphabet[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
    if (third !== undefined) encoded += base64Alphabet[third & 0x3f];
  }
  return encoded.replace(/\+/g, '-').replace(/\//g, '_');
}

function fromBase64Url(value: string): Uint8Array | null {
  let buffer = 0;
  let bits = 0;
  const bytes: number[] = [];
  for (const character of value.replace(/-/g, '+').replace(/_/g, '/')) {
    const position = base64Alphabet.indexOf(character);
    if (position < 0) return null;
    buffer = (buffer << 6) | position;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(bytes);
}

async function readStoredPrivateKey(userId: string): Promise<Uint8Array | null> {
  const storageKey = holderKeyStorageKey(userId);
  const secureStoreAvailable = await SecureStore.isAvailableAsync();
  const serialized = secureStoreAvailable
    ? await SecureStore.getItemAsync(storageKey)
    : memoryOnlyPrivateKeys.get(storageKey) ?? null;
  if (!serialized) return null;

  const privateKey = fromBase64Url(serialized);
  if (privateKey && p256.utils.isValidSecretKey(privateKey)) return privateKey;

  if (secureStoreAvailable) await SecureStore.deleteItemAsync(storageKey);
  else memoryOnlyPrivateKeys.delete(storageKey);
  return null;
}

async function savePrivateKey(userId: string, privateKey: Uint8Array) {
  const storageKey = holderKeyStorageKey(userId);
  const serialized = toBase64Url(privateKey);
  if (!(await SecureStore.isAvailableAsync())) {
    memoryOnlyPrivateKeys.set(storageKey, serialized);
    return;
  }
  await SecureStore.setItemAsync(storageKey, serialized, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function holderPrivateKey(userId: string): Promise<Uint8Array> {
  const stored = await readStoredPrivateKey(userId);
  if (stored) return stored;

  let privateKey = await Crypto.getRandomBytesAsync(32);
  while (!p256.utils.isValidSecretKey(privateKey)) {
    privateKey = await Crypto.getRandomBytesAsync(32);
  }
  await savePrivateKey(userId, privateKey);
  return privateKey;
}

function publicJwk(privateKey: Uint8Array): PublicP256Jwk {
  const publicKey = p256.getPublicKey(privateKey, false);
  if (publicKey.length !== 65 || publicKey[0] !== 0x04) {
    throw new Error('Could not derive the holder public key.');
  }
  return {
    kty: 'EC',
    crv: 'P-256',
    x: toBase64Url(publicKey.slice(1, 33)),
    y: toBase64Url(publicKey.slice(33, 65)),
  };
}

export async function createCredentialOfferProof({
  userId,
  credentialIssuer,
  nonce,
}: HolderProofInput): Promise<string> {
  if (!credentialIssuer?.trim() || !nonce?.trim()) {
    throw new Error('This credential offer is missing the issuer URL or proof nonce. Refresh offers and try again.');
  }

  const privateKey = await holderPrivateKey(userId);
  const header = {
    typ: 'openid4vci-proof+jwt',
    alg: 'ES256',
    jwk: publicJwk(privateKey),
  };
  const payload = {
    iss: userId,
    aud: credentialIssuer,
    nonce,
    iat: Math.floor(Date.now() / 1000),
    jti: Crypto.randomUUID(),
  };
  const encodedHeader = toBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = p256.sign(new TextEncoder().encode(signingInput), privateKey, {
    format: 'compact',
    lowS: true,
  });

  return `${signingInput}.${toBase64Url(signature)}`;
}
