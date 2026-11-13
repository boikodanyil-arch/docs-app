import type { DocumentTypeId } from '../data/documentTypes';
import { parseDocumentText } from './parseDocumentText';

export interface OcrResult {
  type: DocumentTypeId | null;
  validUntil: string | null; // YYYY-MM-DD
  issuedAt: string | null;
}

/**
 * Витягує текст із фото на пристрої.
 * В Expo Go нативного OCR немає — потрібна development build (етап 3).
 * Коли з'явиться OCR-модуль, тільки ця функція змінюється: вона має повернути розпізнаний текст.
 */
async function extractText(_photoUri: string): Promise<string | null> {
  return null;
}

export async function recognizeDocument(photoUri: string): Promise<OcrResult | null> {
  const text = await extractText(photoUri);
  if (!text || !text.trim()) return null;
  const parsed = parseDocumentText(text);
  if (!parsed.type && !parsed.validUntil) return null;
  return parsed;
}
