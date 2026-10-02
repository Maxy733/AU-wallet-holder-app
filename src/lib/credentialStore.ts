import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { CredentialOffer, IssuedCredential } from '../api/types';

export type IssuedCredentialDisplay = {
  holderName: string;
  studentNumber: string;
  issuerName: string;
  issuerDid: string;
  issuedAt?: string;
  degree: string;
  major: string;
  graduationDate: string;
  gpa: string | number;
};

export type StoredIssuedCredential = IssuedCredential & {
  display?: IssuedCredentialDisplay;
  revoked?: boolean;
  revocationReason?: string | null;
};

const memoryOnlyCredentials = new Map<string, StoredIssuedCredential>();

const credentialStorageKey = (userId: string) => `auwallet.issued-credential.${userId}`;

export function credentialDisplayFromOffer(offer: CredentialOffer): IssuedCredentialDisplay {
  return {
    holderName: offer.holderName,
    studentNumber: offer.studentNumber,
    issuerName: offer.issuerName,
    issuerDid: offer.issuerDid,
    degree: offer.preview.degree,
    major: offer.preview.major,
    graduationDate: offer.preview.graduationDate,
    gpa: offer.preview.gpa,
  };
}

// Read display data from the stored VC; this does not verify its signature.
function identityFromCredential(credential: string): Partial<IssuedCredentialDisplay> {
  const decodeJson = (encoded: string): unknown => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let buffer = 0;
    let bits = 0;
    let escaped = '';
    for (const character of encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')) {
      const position = alphabet.indexOf(character);
      if (position < 0) throw new Error('Invalid credential encoding');
      buffer = (buffer << 6) | position;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        escaped += '%' + ((buffer >> bits) & 0xff).toString(16).padStart(2, '0');
      }
    }
    return JSON.parse(decodeURIComponent(escaped));
  };
  const record = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const text = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
  try {
    const [jwt, ...disclosures] = credential.split('~');
    const claims = { ...record(decodeJson(jwt.split('.')[1])) };
    for (const encoded of disclosures) {
      if (!encoded || encoded.includes('.')) continue;
      const disclosure = decodeJson(encoded);
      if (Array.isArray(disclosure) && disclosure.length === 3 && typeof disclosure[1] === 'string') {
        if (['student', 'educationalOrganization'].includes(disclosure[1])) {
          claims[disclosure[1]] = disclosure[2];
        }
      }
    }
    const student = record(claims.student);
    const issuer = record(claims.issuer);
    const organization = record(claims.educationalOrganization);
    const holderName = [text(student.givenName), text(student.familyName)].filter(Boolean).join(' ');
    const studentNumber = text(record(student.identifier).value);
    const issuerName = text(issuer.name) || text(organization.name);
    const issuerDid = text(issuer.id) || text(claims.iss);
    const timestamp = typeof claims.iat === 'number' ? new Date(claims.iat * 1000) : null;
    const issuedAt = text(claims.validFrom) || (timestamp && Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : '');
    return {
      ...(holderName ? { holderName } : {}),
      ...(studentNumber ? { studentNumber } : {}),
      ...(issuerName ? { issuerName } : {}),
      ...(issuerDid ? { issuerDid } : {}),
      ...(issuedAt ? { issuedAt } : {}),
    };
  } catch {
    // Older or mock credentials can continue using their stored display values.
    return {};
  }
}

export async function saveIssuedCredential(
  userId: string,
  credential: IssuedCredential,
  offer?: CredentialOffer,
) {
  const storageKey = credentialStorageKey(userId);
  const storedCredential: StoredIssuedCredential = offer
    ? { ...credential, display: credentialDisplayFromOffer(offer) }
    : credential;
  if (storedCredential.display) {
    storedCredential.display = {
      ...storedCredential.display,
      issuedAt: credential.issuedAt,
      ...identityFromCredential(credential.credential),
    };
  }
  memoryOnlyCredentials.set(storageKey, storedCredential);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(storedCredential));
    return;
  }
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(storageKey, JSON.stringify(storedCredential), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadIssuedCredential(userId: string): Promise<StoredIssuedCredential | null> {
  const storageKey = credentialStorageKey(userId);
  const memoryCredential = memoryOnlyCredentials.get(storageKey);
  let serialized: string | null = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      serialized = window.localStorage.getItem(storageKey);
    } catch {
      // Keep the in-session copy available when browser storage cannot be read.
    }
  } else if (await SecureStore.isAvailableAsync()) {
    serialized = await SecureStore.getItemAsync(storageKey);
  }
  serialized ??= memoryCredential ? JSON.stringify(memoryCredential) : null;
  if (!serialized) return null;

  try {
    const credential = JSON.parse(serialized) as Partial<StoredIssuedCredential>;
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
    if (credential.display) {
      credential.display = {
        ...credential.display,
        issuedAt: credential.issuedAt,
        ...identityFromCredential(credential.credential),
      };
    }
    return credential as StoredIssuedCredential;
  } catch {
    return null;
  }
}

export async function recordCredentialRevocation(userId: string, offerId: string, reason?: string | null): Promise<void> {
  const stored = await loadIssuedCredential(userId);
  if (!stored || stored.offerId !== offerId) return;
  const revocationReason = reason?.trim() || stored.revocationReason || null;
  if (stored.revoked && stored.revocationReason === revocationReason) return;
  await saveIssuedCredential(userId, { ...stored, revoked: true, revocationReason } as StoredIssuedCredential);
}

export async function deleteIssuedCredential(userId: string): Promise<void> {
  const storageKey = credentialStorageKey(userId);
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(storageKey);
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.removeItem(storageKey);
  }
  memoryOnlyCredentials.delete(storageKey);
}
