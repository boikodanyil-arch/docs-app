import { describe, expect, it } from 'vitest';
import { daysLeft, formatDate, maskDateInput, nextReminder, parseInputDate, statusFor } from '../status';

const today = new Date(2026, 10, 13, 15, 30); // 13.11.2026, 15:30

describe('daysLeft / statusFor', () => {
  it('рахує дні від початку дня', () => {
    expect(daysLeft('2026-11-30', today)).toBe(17);
    expect(daysLeft('2026-11-13', today)).toBe(0);
    expect(daysLeft('2026-11-12', today)).toBe(-1);
    expect(daysLeft('2027-08-21', today)).toBe(281);
  });
  it('межі статусів: ≤30 терміново, 31–60 скоро, >60 в порядку', () => {
    expect(statusFor(-5)).toBe('urgent');
    expect(statusFor(30)).toBe('urgent');
    expect(statusFor(31)).toBe('soon');
    expect(statusFor(60)).toBe('soon');
    expect(statusFor(61)).toBe('ok');
  });
});

describe('дати у полях', () => {
  it('parseInputDate', () => {
    expect(parseInputDate('05.06.2031')).toBe('2031-06-05');
    expect(parseInputDate('31.02.2031')).toBeNull();
    expect(parseInputDate('5.6.2031')).toBeNull();
    expect(parseInputDate('')).toBeNull();
  });
  it('maskDateInput', () => {
    expect(maskDateInput('0506')).toBe('05.06');
    expect(maskDateInput('05062031')).toBe('05.06.2031');
    expect(maskDateInput('05.06.20319999')).toBe('05.06.2031');
    expect(maskDateInput('ab')).toBe('');
  });
  it('formatDate', () => expect(formatDate('2026-11-30')).toBe('30.11.2026'));
});

describe('nextReminder', () => {
  it('перше нагадування, яке ще не минуло', () => {
    expect(nextReminder('2026-11-30', today)).toBe('23.11'); // за 7 днів
    expect(nextReminder('2027-01-10', today)).toBe('11.12'); // за 30 днів (за 60 вже минуло)
    expect(nextReminder('2026-11-14', today)).toBeNull();
  });
});
