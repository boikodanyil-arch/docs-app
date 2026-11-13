// Сховище на телефоні: SQLite. Дані нікуди не відправляються.
import * as SQLite from 'expo-sqlite';
import type { DocumentItem, Store } from './types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('docs.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL,
          issued_at TEXT,
          valid_until TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          photo_uri TEXT,
          reminders TEXT NOT NULL DEFAULT '[60,30,7]',
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

interface Row {
  id: string;
  type: string;
  issued_at: string | null;
  valid_until: string;
  note: string;
  photo_uri: string | null;
  reminders: string;
  created_at: number;
}

export const store: Store = {
  async loadDocs() {
    const db = await getDb();
    const rows = await db.getAllAsync<Row>('SELECT * FROM documents ORDER BY valid_until ASC');
    return rows.map((r) => ({
      id: r.id,
      type: r.type as DocumentItem['type'],
      issuedAt: r.issued_at,
      validUntil: r.valid_until,
      note: r.note,
      photoUri: r.photo_uri,
      reminders: JSON.parse(r.reminders) as number[],
      createdAt: r.created_at,
    }));
  },
  async saveDoc(d) {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO documents (id, type, issued_at, valid_until, note, photo_uri, reminders, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      d.id, d.type, d.issuedAt, d.validUntil, d.note, d.photoUri, JSON.stringify(d.reminders), d.createdAt,
    );
  },
  async deleteDoc(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM documents WHERE id = ?', id);
  },
  async loadSettings() {
    const db = await getDb();
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  async setSetting(key, value) {
    const db = await getDb();
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
  },
};
