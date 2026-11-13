import type { DocumentTypeId } from '../data/documentTypes';

export interface ParsedDocument {
  type: DocumentTypeId | null;
  validUntil: string | null; // YYYY-MM-DD
  issuedAt: string | null;
}

// Пошук типу та дат у тексті, який дасть OCR. Працює без інтернету.
// Щоб додати новий тип — додай запис у TYPE_KEYWORDS.

/** нижній регістр, без діакритики (ł → l), зайві пробіли стиснуті */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ \t]+/g, ' ');
}

const TYPE_KEYWORDS: Record<DocumentTypeId, { words: string[]; weight: number }[]> = {
  residenceCard: [
    { words: ['karta pobytu', 'residence card', 'residence permit', 'карта побиту', 'посвідка на проживання', 'карта побыту', 'zezwolenie na pobyt', 'titre de sejour'], weight: 5 },
    { words: ['pobyt', 'rzeczypospolita polska', 'urzad do spraw cudzoziemcow'], weight: 1 },
  ],
  visa: [
    { words: ['wiza', 'visa', 'віза', 'виза', 'schengen', 'szengen'], weight: 4 },
    { words: ['zezwolenie na prace', 'work permit', 'zezwolenie', 'дозвіл на роботу', 'oswiadczenie o powierzeniu'], weight: 3 },
  ],
  lease: [
    { words: ['umowa najmu', 'umowa wynajmu', 'lease agreement', 'rental agreement', 'договір оренди', 'договор аренды', 'договір найму'], weight: 6 },
    { words: ['najem', 'najmu', 'wynajm', 'najemca', 'wynajmujacy', 'lokal', 'tenant', 'landlord', 'орендар', 'орендодав'], weight: 2 },
  ],
  insurance: [
    { words: ['ubezpieczenie', 'polisa', 'insurance', 'insurance policy', 'страховка', 'страховий поліс', 'страхов', 'nfz', 'ehic'], weight: 4 },
    { words: ['ubezpieczyciel', 'skladka', 'policy', 'ubezpieczon'], weight: 1 },
  ],
  passport: [
    { words: ['paszport', 'passport', 'паспорт', 'pasaport'], weight: 5 },
    { words: ['p<'], weight: 4 }, // початок MRZ: P<UKR…
  ],
};

export function detectType(text: string): DocumentTypeId | null {
  const n = normalize(text);
  let best: DocumentTypeId | null = null;
  let bestScore = 0;
  for (const [type, groups] of Object.entries(TYPE_KEYWORDS) as [DocumentTypeId, { words: string[]; weight: number }[]][]) {
    let score = 0;
    for (const g of groups) {
      for (const w of g.words) if (n.includes(normalize(w))) score += g.weight;
    }
    if (score > bestScore) {
      bestScore = score;
      best = type;
    }
  }
  return best;
}

const MONTHS: Record<string, number> = {
  // pl
  stycznia: 1, styczen: 1, lutego: 2, luty: 2, marca: 3, marzec: 3, kwietnia: 4, kwiecien: 4, maja: 5, maj: 5,
  czerwca: 6, czerwiec: 6, lipca: 7, lipiec: 7, sierpnia: 8, sierpien: 8, wrzesnia: 9, wrzesien: 9,
  pazdziernika: 10, pazdziernik: 10, listopada: 11, listopad: 11, grudnia: 12, grudzien: 12,
  // en
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
  jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
  // uk
  'січня': 1, 'лютого': 2, 'березня': 3, 'квітня': 4, 'травня': 5, 'червня': 6, 'липня': 7, 'серпня': 8,
  'вересня': 9, 'жовтня': 10, 'листопада': 11, 'грудня': 12,
};

interface FoundDate {
  iso: string;
  index: number;
  end: number;
}

function toIso(y: number, m: number, d: number): string | null {
  if (y < 1990 || y > 2100) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function findDates(text: string): FoundDate[] {
  const n = normalize(text);
  const found: FoundDate[] = [];
  const taken: [number, number][] = [];
  const free = (a: number, b: number) => !taken.some(([x, y]) => a < y && b > x);
  const add = (iso: string | null, index: number, len: number) => {
    if (iso && free(index, index + len)) {
      found.push({ iso, index, end: index + len });
      taken.push([index, index + len]);
    }
  };

  // 05 jun 2031 / 5 czerwca 2031 / 05 ЧЕР 2031 (місяць словом)
  for (const m of n.matchAll(/(\d{1,2})[ .\-/]*([a-zа-яіїєґ]{3,12})\.?[ .\-/]*(\d{4})/g)) {
    const mon = MONTHS[m[2]];
    if (mon) add(toIso(Number(m[3]), mon, Number(m[1])), m.index!, m[0].length);
  }
  // 2031-06-05
  for (const m of n.matchAll(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/g)) {
    add(toIso(Number(m[1]), Number(m[2]), Number(m[3])), m.index!, m[0].length);
  }
  // 05.06.2031, 05/06/2031, 05-06-2031, 05 06 2031
  for (const m of n.matchAll(/(\d{1,2})[.\-/ ](\d{1,2})[.\-/ ](\d{4})/g)) {
    add(toIso(Number(m[3]), Number(m[2]), Number(m[1])), m.index!, m[0].length);
  }
  return found.sort((a, b) => a.index - b.index);
}

const EXPIRY_WORDS = [
  'wazny do', 'wazna do', 'waznosc', 'data waznosci', 'wazne do', 'do dnia', 'na okres do', 'konczy sie',
  'valid until', 'valid to', 'valid thru', 'expiry', 'expires', 'expiration', 'date of expiry', 'exp.',
  'термін дії', 'дійсний до', 'дійсна до', 'дата закінчення', 'до дати', 'срок действия', 'действителен до',
];
const ISSUE_WORDS = [
  'data wydania', 'wydano', 'wydany', 'wydana', 'data zawarcia', 'zawarta w dniu', 'zawarta',
  'date of issue', 'issued', 'issue date', 'date of issuance',
  'видано', 'дата видачі', 'дата видачи', 'выдан', 'дата выдачи',
];
const BIRTH_WORDS = ['data urodzenia', 'urodz', 'date of birth', 'birth', 'dob', 'народж', 'рожд'];

function roleOf(text: string, d: FoundDate): 'expiry' | 'issue' | 'birth' | null {
  const n = normalize(text);
  const before = n.slice(Math.max(0, d.index - 45), d.index);
  // беремо тільки поточний рядок (+ попередній, якщо дата на початку рядка)
  const lines = before.split('\n');
  const ctx = lines.length > 1 && lines[lines.length - 1].trim() === '' ? lines.slice(-2).join(' ') : lines[lines.length - 1];
  const last = (words: string[]) => Math.max(...words.map((w) => ctx.lastIndexOf(normalize(w))));
  const e = last(EXPIRY_WORDS);
  const i = last(ISSUE_WORDS);
  const b = last(BIRTH_WORDS);
  const best = Math.max(e, i, b);
  if (best < 0) return null;
  if (best === b) return 'birth';
  if (best === i) return 'issue';
  return 'expiry';
}

export function parseDocumentText(text: string): ParsedDocument {
  const type = detectType(text);
  const dates = findDates(text);
  const n = normalize(text);

  let validUntil: string | null = null;
  let issuedAt: string | null = null;

  // "od 11.01.2026 do 10.01.2027" / "from … to …"
  for (let k = 0; k + 1 < dates.length; k++) {
    const between = n.slice(dates[k].end, dates[k + 1].index).trim();
    if (/^(do|to|-|–|—|по|until|till)$/.test(between)) {
      const lead = n.slice(Math.max(0, dates[k].index - 12), dates[k].index);
      if (/(od|from|з|с)\s*$/.test(lead) || true) {
        issuedAt = dates[k].iso;
        validUntil = dates[k + 1].iso;
        break;
      }
    }
  }

  if (!validUntil || !issuedAt) {
    const roles = dates.map((d) => ({ d, role: roleOf(text, d) }));
    if (!validUntil) validUntil = roles.find((r) => r.role === 'expiry')?.d.iso ?? null;
    if (!issuedAt) issuedAt = roles.find((r) => r.role === 'issue')?.d.iso ?? null;

    // без підказок: серед дат без ролі «дата народження» беремо найпізнішу як «дійсний до»
    if (!validUntil) {
      const rest = roles.filter((r) => r.role === null && r.d.iso !== issuedAt).map((r) => r.d.iso).sort();
      if (rest.length > 0) validUntil = rest[rest.length - 1];
    }
    if (!issuedAt && validUntil) {
      const earlier = roles.filter((r) => r.role === null && r.d.iso < validUntil!).map((r) => r.d.iso).sort();
      if (earlier.length > 0) issuedAt = earlier[0];
    }
  }

  if (issuedAt && validUntil && issuedAt >= validUntil) issuedAt = null;
  return { type, validUntil, issuedAt };
}
