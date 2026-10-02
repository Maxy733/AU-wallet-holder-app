import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { HistoryEvent, ShareFields } from '../types';

const memoryHistory = new Map<string, HistoryEvent[]>();
const historyKey = (userId: string) => `auwallet.employer-history.${userId}`;

function parseHistory(serialized: string): HistoryEvent[] {
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((value): HistoryEvent[] => {
    if (!value || typeof value !== 'object') return [];
    const event = value as Partial<HistoryEvent>;
    if (event.type !== 'share' || event.fromCamera === true ||
        typeof event.id !== 'string' || typeof event.title !== 'string' ||
        typeof event.subtitle !== 'string' || typeof event.occurredAt !== 'string' ||
        !Number.isFinite(Date.parse(event.occurredAt))) return [];
    const fields = event.sharedFields;
    const validFields = fields && ['degree', 'major', 'graduation', 'gpa'].every((key) =>
      typeof fields[key as keyof ShareFields] === 'boolean',
    );
    return [{
      id: event.id,
      type: 'share',
      title: event.title,
      subtitle: event.subtitle,
      occurredAt: event.occurredAt,
      targetScreen: 'receipt',
      fromCamera: false,
      ...(validFields && fields ? { sharedFields: { ...fields } } : {}),
    }];
  }).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}

export async function loadSharingHistory(userId: string): Promise<HistoryEvent[]> {
  const key = historyKey(userId);
  let serialized: string | null = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    serialized = window.localStorage.getItem(key);
  } else if (await SecureStore.isAvailableAsync()) {
    serialized = await SecureStore.getItemAsync(key);
  }
  if (!serialized) return memoryHistory.get(key) ?? [];
  try {
    const events = parseHistory(serialized);
    memoryHistory.set(key, events);
    return events;
  } catch {
    return memoryHistory.get(key) ?? [];
  }
}

export async function appendSharingHistory(userId: string, event: HistoryEvent): Promise<void> {
  if (event.type !== 'share' || event.fromCamera === true) return;
  const key = historyKey(userId);
  const previous = await loadSharingHistory(userId);
  const next = [event, ...previous.filter((item) => item.id !== event.id)]
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(next));
  } else if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(key, JSON.stringify(next), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  memoryHistory.set(key, next);
}
