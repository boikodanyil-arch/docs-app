// Кольори, радіуси й шрифти з prototype.html
export const colors = {
  bg: '#F5F4EF',
  text: '#14161B',
  textSecondary: '#5B6070',
  card: '#FFFFFF',
  border: '#ECEBE4',
  borderStrong: '#E3E2DB',
  accent: '#2340D9',
  dark: '#14161B',
  welcome: '#0F1220',
  white: '#FFFFFF',
} as const;

export type Status = 'urgent' | 'soon' | 'ok';

export const statusColors: Record<Status, { fg: string; bg: string }> = {
  urgent: { fg: '#B42318', bg: '#FDECEA' },
  soon: { fg: '#8A5300', bg: '#FFF3DC' },
  ok: { fg: '#1B6B45', bg: '#E6F4EC' },
};

export const radius = { card: 20, hero: 26, button: 18, pill: 999 } as const;

export const fonts = {
  heading: 'Unbounded_600SemiBold',
  regular: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;
