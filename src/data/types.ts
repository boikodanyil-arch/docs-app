import type { DocumentTypeId } from './documentTypes';

export interface DocumentItem {
  id: string;
  type: DocumentTypeId;
  issuedAt: string | null; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  note: string;
  photoUri: string | null;
  reminders: number[]; // за скільки днів нагадувати, напр. [60, 30, 7]
  createdAt: number;
}

export interface Store {
  loadDocs(): Promise<DocumentItem[]>;
  saveDoc(doc: DocumentItem): Promise<void>;
  deleteDoc(id: string): Promise<void>;
  loadSettings(): Promise<Record<string, string>>;
  setSetting(key: string, value: string): Promise<void>;
}
