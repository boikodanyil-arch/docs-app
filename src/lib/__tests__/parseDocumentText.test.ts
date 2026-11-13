import { describe, expect, it } from 'vitest';
import { detectType, findDates, parseDocumentText } from '../parseDocumentText';

describe('findDates', () => {
  it('розуміє різні формати', () => {
    const iso = (s: string) => findDates(s).map((d) => d.iso);
    expect(iso('05.06.2031')).toEqual(['2031-06-05']);
    expect(iso('5/6/2031')).toEqual(['2031-06-05']);
    expect(iso('2031-06-05')).toEqual(['2031-06-05']);
    expect(iso('05 JUN 2031')).toEqual(['2031-06-05']);
    expect(iso('5 czerwca 2031')).toEqual(['2031-06-05']);
    expect(iso('05 червня 2031')).toEqual(['2031-06-05']);
  });
  it('ігнорує неіснуючі дати й сміття', () => {
    expect(findDates('31.02.2030')).toEqual([]);
    expect(findDates('тел 123 456 7890')).toEqual([]);
  });
});

describe('detectType', () => {
  it('знаходить п’ять типів', () => {
    expect(detectType('KARTA POBYTU\nResidence permit')).toBe('residenceCard');
    expect(detectType('PASZPORT / PASSPORT UKR')).toBe('passport');
    expect(detectType('P<UKRSHEVCHENKO<<TARAS')).toBe('passport');
    expect(detectType('UMOWA NAJMU LOKALU MIESZKALNEGO')).toBe('lease');
    expect(detectType('Polisa ubezpieczenia zdrowotnego')).toBe('insurance');
    expect(detectType('VISA Schengen')).toBe('visa');
  });
  it('нічого не вигадує', () => {
    expect(detectType('просто текст без документів')).toBeNull();
  });
});

describe('parseDocumentText', () => {
  it('karta pobytu: дата ważności і дата wydania', () => {
    const r = parseDocumentText(
      'KARTA POBYTU\nData urodzenia: 12.03.1990\nData wydania: 21.08.2024\nWażna do: 21.08.2027',
    );
    expect(r).toEqual({ type: 'residenceCard', issuedAt: '2024-08-21', validUntil: '2027-08-21' });
  });
  it('паспорт англійською, місяць словом', () => {
    const r = parseDocumentText('PASSPORT\nDate of birth 14 MAR 1990\nDate of issue 05 JUN 2021\nDate of expiry 05 JUN 2031');
    expect(r).toEqual({ type: 'passport', issuedAt: '2021-06-05', validUntil: '2031-06-05' });
  });
  it('umowa najmu: «od … do …»', () => {
    const r = parseDocumentText('UMOWA NAJMU\nzawarta na okres od 11.01.2026 do 10.01.2027');
    expect(r).toEqual({ type: 'lease', issuedAt: '2026-01-11', validUntil: '2027-01-10' });
  });
  it('страховка: «valid until»', () => {
    const r = parseDocumentText('Polisa ubezpieczeniowa nr 123\nValid until 30.11.2026');
    expect(r.type).toBe('insurance');
    expect(r.validUntil).toBe('2026-11-30');
  });
  it('дата народження не стає датою закінчення', () => {
    const r = parseDocumentText('PASSPORT\nDate of birth 14.03.1990');
    expect(r.validUntil).toBeNull();
  });
  it('без підказок бере найпізнішу дату', () => {
    const r = parseDocumentText('KARTA POBYTU\n01.02.2024\n01.02.2027');
    expect(r.validUntil).toBe('2027-02-01');
    expect(r.issuedAt).toBe('2024-02-01');
  });
  it('порожній текст', () => {
    expect(parseDocumentText('')).toEqual({ type: null, validUntil: null, issuedAt: null });
  });
});
