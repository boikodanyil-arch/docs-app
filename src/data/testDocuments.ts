import type { DocumentTypeId } from './documentTypes';

export interface DocumentItem {
  id: string;
  type: DocumentTypeId;
  validUntil: string; // YYYY-MM-DD
}

// Тестові дані (поки без бази). На етапі 2 далі замінимо на SQLite.
export const testDocuments: DocumentItem[] = [
  { id: '1', type: 'insurance', validUntil: '2026-11-30' },
  { id: '2', type: 'lease', validUntil: '2027-01-10' },
  { id: '3', type: 'residenceCard', validUntil: '2027-08-21' },
];

export const FREE_LIMIT = 3;
