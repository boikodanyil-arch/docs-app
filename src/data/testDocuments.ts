import type { DocumentItem } from './types';

export const FREE_LIMIT = 3;

function plusDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Тестові документи (від сьогоднішньої дати): 17, 58 і 281 день. */
export function makeTestDocuments(): DocumentItem[] {
  const now = Date.now();
  return [
    { id: `test-${now}-1`, type: 'insurance', issuedAt: null, validUntil: plusDays(17), note: '', photoUri: null, reminders: [60, 30, 7], createdAt: now },
    { id: `test-${now}-2`, type: 'lease', issuedAt: null, validUntil: plusDays(58), note: '', photoUri: null, reminders: [60, 30, 7], createdAt: now + 1 },
    { id: `test-${now}-3`, type: 'residenceCard', issuedAt: null, validUntil: plusDays(281), note: '', photoUri: null, reminders: [60, 30, 7], createdAt: now + 2 },
  ];
}
