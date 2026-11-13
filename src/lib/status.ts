import type { Status } from '../theme';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Скільки днів лишилось до дати "YYYY-MM-DD" (від початку сьогоднішнього дня). */
export function daysLeft(isoDate: string, today: Date = new Date()): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  return Math.round((target.getTime() - startOfDay(today).getTime()) / MS_PER_DAY);
}

/** терміново: до 30 днів; скоро: 30–60; в порядку: понад 60 */
export function statusFor(days: number): Status {
  if (days <= 30) return 'urgent';
  if (days <= 60) return 'soon';
  return 'ok';
}

/** "2026-11-30" -> "30.11.2026" */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

/** Наступне нагадування (за 60, 30, 7 днів до кінця), яке ще не минуло. */
export function nextReminder(isoDate: string, today: Date = new Date()): string | null {
  const [y, m, d] = isoDate.split('-').map(Number);
  const end = new Date(y, m - 1, d);
  const t = startOfDay(today).getTime();
  for (const before of [60, 30, 7]) {
    const r = new Date(end.getTime() - before * MS_PER_DAY);
    if (r.getTime() >= t) {
      return `${String(r.getDate()).padStart(2, '0')}.${String(r.getMonth() + 1).padStart(2, '0')}`;
    }
  }
  return null;
}
