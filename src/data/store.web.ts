// Для перегляду в браузері: localStorage замість SQLite.
import type { DocumentItem, Store } from './types';

const DOCS = 'docs-app:documents';
const SETTINGS = 'docs-app:settings';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {}
}

export const store: Store = {
  async loadDocs() {
    return read<DocumentItem[]>(DOCS, []).sort((a, b) => a.validUntil.localeCompare(b.validUntil));
  },
  async saveDoc(d) {
    const all = read<DocumentItem[]>(DOCS, []).filter((x) => x.id !== d.id);
    write(DOCS, [...all, d]);
  },
  async deleteDoc(id) {
    write(DOCS, read<DocumentItem[]>(DOCS, []).filter((x) => x.id !== id));
  },
  async loadSettings() {
    return read<Record<string, string>>(SETTINGS, {});
  },
  async setSetting(key, value) {
    write(SETTINGS, { ...read<Record<string, string>>(SETTINGS, {}), [key]: value });
  },
};
