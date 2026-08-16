import * as SecureStore from 'expo-secure-store';

export type HolderIdentity = {
  firstName: string;
  lastName: string;
  studentId: string;
};

const emptyIdentity: HolderIdentity = { firstName: '', lastName: '', studentId: '' };
const memoryOnlyIdentities = new Map<string, HolderIdentity>();
const identityKey = (userId: string) => `auwallet.identity.${userId}`;

function stableEmailKey(email: string) {
  let hash = 2166136261;
  for (const character of email.trim().toLowerCase()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `auwallet.identity.email.${(hash >>> 0).toString(16)}`;
}

function normalizeIdentity(value: unknown): HolderIdentity {
  if (!value || typeof value !== 'object') return { ...emptyIdentity };
  const candidate = value as Partial<HolderIdentity>;
  return {
    firstName: typeof candidate.firstName === 'string' ? candidate.firstName : '',
    lastName: typeof candidate.lastName === 'string' ? candidate.lastName : '',
    studentId: typeof candidate.studentId === 'string' ? candidate.studentId : '',
  };
}

async function readIdentity(key: string): Promise<HolderIdentity | null> {
  if (!(await SecureStore.isAvailableAsync())) {
    return memoryOnlyIdentities.get(key) ?? null;
  }

  const serialized = await SecureStore.getItemAsync(key);
  if (!serialized) return null;
  try {
    return normalizeIdentity(JSON.parse(serialized));
  } catch {
    return null;
  }
}

export async function loadHolderIdentity(userId: string, email?: string): Promise<HolderIdentity> {
  const byUserId = await readIdentity(identityKey(userId));
  if (byUserId && (byUserId.firstName || byUserId.lastName || byUserId.studentId)) return byUserId;
  if (email) {
    const byEmail = await readIdentity(stableEmailKey(email));
    if (byEmail && (byEmail.firstName || byEmail.lastName || byEmail.studentId)) return byEmail;
  }
  return byUserId ?? { ...emptyIdentity };
}

async function writeIdentity(key: string, identity: HolderIdentity) {
  memoryOnlyIdentities.set(key, identity);
  if (!(await SecureStore.isAvailableAsync())) return;
  await SecureStore.setItemAsync(key, JSON.stringify(identity), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function saveHolderIdentity(userId: string, identity: HolderIdentity, email?: string) {
  const normalized = normalizeIdentity(identity);
  await writeIdentity(identityKey(userId), normalized);
  if (email) await writeIdentity(stableEmailKey(email), normalized);
}
