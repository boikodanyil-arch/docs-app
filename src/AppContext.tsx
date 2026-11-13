import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { documentTypes } from './data/documentTypes';
import { store } from './data/store';
import { makeTestDocuments } from './data/testDocuments';
import type { DocumentItem } from './data/types';
import { useI18n } from './i18n';
import { removePhoto } from './lib/files';
import type { OcrResult } from './lib/ocr';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { cancelDocReminders, scheduleDocReminders, setReminderHour } from './lib/reminders';

export type Tab = 'docs' | 'reminders' | 'settings';

export type Route =
  | { name: 'main' }
  | { name: 'scan'; renewOf?: string }
  | { name: 'confirm'; photoUri: string | null; recognized: OcrResult | null; docId?: string; renewOf?: string }
  | { name: 'detail'; docId: string };

export interface Settings {
  welcomeSeen: boolean;
  lock: boolean;
  defaultReminders: number[];
  unlockAll: boolean;
  reminderHour: number;
}

function parseSettings(raw: Record<string, string>): Settings {
  let defaults = [60, 30, 7];
  try {
    if (raw.defaultReminders) defaults = JSON.parse(raw.defaultReminders);
  } catch {}
  return {
    welcomeSeen: raw.welcomeSeen === '1',
    lock: raw.lock === '1',
    defaultReminders: defaults,
    unlockAll: raw.unlockAll === '1',
    reminderHour: raw.reminderHour ? Number(JSON.parse(raw.reminderHour)) || 9 : 9,
  };
}

interface Ctx {
  docs: DocumentItem[];
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  saveDocument: (doc: DocumentItem) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  addTestDocuments: () => Promise<void>;
  clearDocuments: () => Promise<void>;
  rescheduleAll: () => Promise<void>;
  // навігація
  tab: Tab;
  setTab: (t: Tab) => void;
  route: Route;
  push: (r: Route) => void;
  pop: () => void;
  reset: (r?: Route) => void;
  paywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({
  initialDocs,
  initialSettings,
  children,
}: {
  initialDocs: DocumentItem[];
  initialSettings: Record<string, string>;
  children: React.ReactNode;
}) {
  const { t, days, lang } = useI18n();
  const [docs, setDocs] = useState(initialDocs);
  const [settings, setSettings] = useState(() => parseSettings(initialSettings));
  const [tab, setTab] = useState<Tab>('docs');
  const [stack, setStack] = useState<Route[]>([{ name: 'main' }]);
  const [paywallOpen, setPaywallOpen] = useState(false);
  setReminderHour(settings.reminderHour);

  const schedule = useCallback(
    (doc: DocumentItem) =>
      scheduleDocReminders(doc, (type, offset) => ({
        title: t('rem.notifTitle', { doc: t(documentTypes[type].title) }),
        body: t('rem.notifBody', { d: days(offset) }),
      })),
    [t, days],
  );

  const rescheduleAll = useCallback(async () => {
    for (const d of docs) await schedule(d);
  }, [docs, schedule]);

  // мова чи година змінились — оновити заплановані сповіщення
  useEffect(() => {
    rescheduleAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, settings.reminderHour]);

  // тап по сповіщенню відкриває картку документа
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const open = (resp: Notifications.NotificationResponse | null | undefined) => {
      const id = resp?.notification.request.content.data?.docId;
      if (typeof id === 'string') setStack([{ name: 'main' }, { name: 'detail', docId: id }]);
    };
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, []);

  const updateSetting: Ctx['updateSetting'] = useCallback(async (key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
    const stored = typeof value === 'boolean' ? (value ? '1' : '0') : JSON.stringify(value);
    await store.setSetting(key, stored);
  }, []);

  const saveDocument = useCallback(
    async (doc: DocumentItem) => {
      await store.saveDoc(doc);
      setDocs((all) => [...all.filter((d) => d.id !== doc.id), doc].sort((a, b) => a.validUntil.localeCompare(b.validUntil)));
      await schedule(doc).catch(() => {});
    },
    [schedule],
  );

  const removeDocument = useCallback(
    async (id: string) => {
      const doc = docs.find((d) => d.id === id);
      await cancelDocReminders(id).catch(() => {});
      await store.deleteDoc(id);
      if (doc) await removePhoto(doc.photoUri);
      setDocs((all) => all.filter((d) => d.id !== id));
    },
    [docs],
  );

  const addTestDocuments = useCallback(async () => {
    for (const d of makeTestDocuments()) await saveDocument(d);
  }, [saveDocument]);

  const clearDocuments = useCallback(async () => {
    for (const d of docs) await removeDocument(d.id);
  }, [docs, removeDocument]);

  const value = useMemo<Ctx>(
    () => ({
      docs,
      settings,
      updateSetting,
      saveDocument,
      removeDocument,
      addTestDocuments,
      clearDocuments,
      rescheduleAll,
      tab,
      setTab,
      route: stack[stack.length - 1],
      push: (r) => setStack((s) => [...s, r]),
      pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      reset: (r = { name: 'main' }) => setStack([r]),
      paywallOpen,
      openPaywall: () => setPaywallOpen(true),
      closePaywall: () => setPaywallOpen(false),
    }),
    [docs, settings, updateSetting, saveDocument, removeDocument, addTestDocuments, clearDocuments, rescheduleAll, tab, stack, paywallOpen],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
