import React, { createContext, useContext, useMemo, useState } from 'react';

export type Lang = 'uk' | 'pl';

const dict = {
  uk: {
    'welcome.title1': 'Усі документи.',
    'welcome.title2': 'Усі строки.',
    'welcome.title3': 'Під контролем.',
    'welcome.feature1': 'Скан — і тип та дата визначаться самі',
    'welcome.feature2': 'Нагадування за 60, 30 і 7 днів',
    'welcome.feature3': 'Тільки на твоєму телефоні, без акаунта',
    'welcome.start': 'Почати',
    'welcome.disclaimer': 'Не є юридичною порадою',
    'welcome.cardExpires': 'Страховка закінчується',
    'welcome.cardIn': 'через 17 днів · 30.11',
    'welcome.cardValid': 'Дійсна · 281 день',
    'docs.title': 'Мої документи',
    'docs.settings': 'Налаштування',
    'docs.all': 'Усі документи',
    'docs.freeCounter': '{n} з {max} безкоштовних',
    'docs.until': 'до {date}',
    'docs.validUntil': 'Дійсна до {date}',
    'docs.nextReminder': 'Наступне нагадування: {date}',
    'docs.days': 'днів',
    'docs.scan': 'Сканувати документ',
    'docs.empty': 'Поки немає документів',
    'nav.docs': 'Документи',
    'nav.reminders': 'Нагадування',
    'nav.settings': 'Налаштування',
    'nav.label': 'Основна навігація',
    'status.urgent': 'Терміново',
    'status.soon': 'Скоро',
    'status.ok': 'В порядку',
    'type.residenceCard': 'Karta pobytu',
    'type.residenceCard.sub': 'Карта побиту',
    'type.visa': 'Віза / дозвіл',
    'type.visa.sub': 'Віза / дозвіл',
    'type.lease': 'Umowa najmu',
    'type.lease.sub': 'Договір оренди',
    'type.insurance': "Страховка здоров'я",
    'type.insurance.sub': "Страховка здоров'я",
    'type.passport': 'Паспорт',
    'type.passport.sub': 'Паспорт',
    'unit.day.one': '{n} день',
    'unit.day.few': '{n} дні',
    'unit.day.many': '{n} днів',
    'unit.day.expired': 'Прострочено',
  },
  pl: {
    'welcome.title1': 'Wszystkie dokumenty.',
    'welcome.title2': 'Wszystkie terminy.',
    'welcome.title3': 'Pod kontrolą.',
    'welcome.feature1': 'Skan — a typ i data rozpoznają się same',
    'welcome.feature2': 'Przypomnienia 60, 30 i 7 dni wcześniej',
    'welcome.feature3': 'Tylko na Twoim telefonie, bez konta',
    'welcome.start': 'Zaczynamy',
    'welcome.disclaimer': 'To nie jest porada prawna',
    'welcome.cardExpires': 'Ubezpieczenie wygasa',
    'welcome.cardIn': 'za 17 dni · 30.11',
    'welcome.cardValid': 'Ważna · 281 dni',
    'docs.title': 'Moje dokumenty',
    'docs.settings': 'Ustawienia',
    'docs.all': 'Wszystkie dokumenty',
    'docs.freeCounter': '{n} z {max} bezpłatnych',
    'docs.until': 'do {date}',
    'docs.validUntil': 'Ważny do {date}',
    'docs.nextReminder': 'Następne przypomnienie: {date}',
    'docs.days': 'dni',
    'docs.scan': 'Skanuj dokument',
    'docs.empty': 'Brak dokumentów',
    'nav.docs': 'Dokumenty',
    'nav.reminders': 'Przypomnienia',
    'nav.settings': 'Ustawienia',
    'nav.label': 'Nawigacja główna',
    'status.urgent': 'Pilne',
    'status.soon': 'Wkrótce',
    'status.ok': 'W porządku',
    'type.residenceCard': 'Karta pobytu',
    'type.residenceCard.sub': 'Karta pobytu',
    'type.visa': 'Wiza / zezwolenie',
    'type.visa.sub': 'Wiza / zezwolenie',
    'type.lease': 'Umowa najmu',
    'type.lease.sub': 'Umowa najmu',
    'type.insurance': 'Ubezpieczenie zdrowotne',
    'type.insurance.sub': 'Ubezpieczenie zdrowotne',
    'type.passport': 'Paszport',
    'type.passport.sub': 'Paszport',
    'unit.day.one': '{n} dzień',
    'unit.day.few': '{n} dni',
    'unit.day.many': '{n} dni',
    'unit.day.expired': 'Przeterminowany',
  },
} as const;

export type Key = keyof (typeof dict)['uk'];

const weekdays = {
  uk: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'],
  pl: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
};
const months = {
  uk: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
  pl: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
};

type Params = Record<string, string | number>;

function format(tpl: string, params?: Params) {
  if (!params) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''));
}

function dayForm(lang: Lang, n: number): 'one' | 'few' | 'many' {
  const m10 = n % 10;
  const m100 = n % 100;
  if (lang === 'uk') {
    if (m10 === 1 && m100 !== 11) return 'one';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few';
    return 'many';
  }
  return n === 1 ? 'one' : 'many';
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, params?: Params) => string;
  days: (n: number) => string;
  longDate: (d: Date) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('uk');
  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, params) => format(dict[lang][key], params),
      days: (n) =>
        n < 0
          ? dict[lang]['unit.day.expired']
          : format(dict[lang][`unit.day.${dayForm(lang, n)}`], { n }),
      longDate: (d) => `${weekdays[lang][d.getDay()]}, ${d.getDate()} ${months[lang][d.getMonth()]}`,
    }),
    [lang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n must be used inside I18nProvider');
  return v;
}
