import * as SecureStore from 'expo-secure-store';

export type HolderIdentity = {
  firstName: string;
  lastName: string;
  studentId: string;
};

const emptyIdentity: HolderIdentity = { firstName: '', lastName: '', studentId: '' };
const memoryOnlyIdentities = new Map<string, HolderIdentity>();
const identityKey = (userId: string) => `auwallet.identity.${userId}`;

function normalizeIdentity(value: unknown): HolderIdentity {
  if (!value || typeof value !== 'object') return { ...emptyIdentity };
  const candidate = value as Partial<HolderIdentity>;
  return {
    firstName: typeof candidate.firstName === 'string' ? candidate.firstName : '',
    lastName: typeof candidate.lastName === 'string' ? candidate.lastName : '',
    studentId: typeof candidate.studentId === 'string' ? candidate.studentId : '',
  };
}

export async function loadHolderIdentity(userId: string): Promise<HolderIdentity> {
  if (!(await SecureStore.isAvailableAsync())) {
    return memoryOnlyIdentities.get(identityKey(userId)) ?? { ...emptyIdentity };
  }

  const serialized = await SecureStore.getItemAsync(identityKey(userId));
  if (!serialized) return { ...emptyIdentity };
  try {
    return normalizeIdentity(JSON.parse(serialized));
  } catch {
    return { ...emptyIdentity };
  }
}

export async function saveHolderIdentity(userId: string, identity: HolderIdentity) {
  const normalized = normalizeIdentity(identity);
  memoryOnlyIdentities.set(identityKey(userId), normalized);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(identityKey(userId), JSON.stringify(normalized), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
