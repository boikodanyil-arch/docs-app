import type { DocumentTypeId } from '../data/documentTypes';

export interface OcrResult {
  type: DocumentTypeId | null;
  validUntil: string | null; // YYYY-MM-DD
  issuedAt: string | null;
}

/**
 * Розпізнавання тексту на пристрої.
 * В Expo Go нативного OCR немає — потрібна development build (етап 3 плану).
 * Поки повертаємо null, і користувач заповнює дані вручну.
 * Сюди підключимо OCR-модуль, коли будемо робити development build.
 */
export async function recognizeDocument(_photoUri: string): Promise<OcrResult | null> {
  return null;
}
