import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { DocumentItem } from '../data/types';
import { toDate } from './status';

export const ALL_OFFSETS = [60, 30, 7] as const;
let hour = 9; // година, о котрій приходять нагадування (налаштування)
export function setReminderHour(h: number) {
  hour = h;
}

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function reminderDate(validUntil: string, offsetDays: number): Date {
  const d = toDate(validUntil);
  d.setDate(d.getDate() - offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d;
}

const idFor = (docId: string, offset: number) => `${docId}:${offset}`;

export async function hasNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  const p = await Notifications.getPermissionsAsync();
  return p.granted;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return true;
  if (!p.canAskAgain) return false;
  const r = await Notifications.requestPermissionsAsync();
  return r.granted;
}

export async function cancelDocReminders(docId: string) {
  if (isWeb) return;
  await Promise.all(
    ALL_OFFSETS.map((o) => Notifications.cancelScheduledNotificationAsync(idFor(docId, o)).catch(() => {})),
  );
}

/** Перепланувати локальні нагадування документа. text() дає заголовок і текст з урахуванням мови. */
export async function scheduleDocReminders(
  doc: DocumentItem,
  text: (type: DocumentItem['type'], offset: number) => { title: string; body: string },
) {
  if (isWeb) return;
  await cancelDocReminders(doc.id);
  if (!(await hasNotificationPermission())) return;
  const now = Date.now();
  for (const offset of doc.reminders) {
    const when = reminderDate(doc.validUntil, offset);
    if (when.getTime() <= now) continue;
    const { title, body } = text(doc.type, offset);
    await Notifications.scheduleNotificationAsync({
      identifier: idFor(doc.id, offset),
      content: { title, body, data: { docId: doc.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}
