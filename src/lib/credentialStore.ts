import * as SecureStore from 'expo-secure-store';

import type { CredentialOffer, IssuedCredential } from '../api/types';

export type IssuedCredentialDisplay = {
  holderName: string;
  studentNumber: string;
  issuerName: string;
  issuerDid: string;
  degree: string;
  major: string;
  graduationDate: string;
  gpa: string | number;
};

export type StoredIssuedCredential = IssuedCredential & {
  display?: IssuedCredentialDisplay;
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

export async function saveIssuedCredential(
  userId: string,
  credential: IssuedCredential,
  offer?: CredentialOffer,
) {
  const storageKey = credentialStorageKey(userId);
  const storedCredential: StoredIssuedCredential = offer
    ? { ...credential, display: credentialDisplayFromOffer(offer) }
    : credential;
  memoryOnlyCredentials.set(storageKey, storedCredential);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(storageKey, JSON.stringify(storedCredential), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadIssuedCredential(userId: string): Promise<StoredIssuedCredential | null> {
  const storageKey = credentialStorageKey(userId);
  const memoryCredential = memoryOnlyCredentials.get(storageKey);
  const serialized = (await SecureStore.isAvailableAsync())
    ? await SecureStore.getItemAsync(storageKey)
    : memoryCredential ? JSON.stringify(memoryCredential) : null;
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
    return credential as StoredIssuedCredential;
  } catch {
    return null;
  }
}
