import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { FadeIn } from '../components/motion';
import { ProgressRing } from '../components/ProgressRing';
import { StatusPill } from '../components/StatusPill';
import { documentTypes } from '../data/documentTypes';
import { FREE_LIMIT } from '../data/testDocuments';
import { useApp } from '../AppContext';
import { daysLeft, formatDate, nextReminder, statusFor } from '../lib/status';
import { useI18n } from '../i18n';
import { colors, fonts, radius, statusColors } from '../theme';

const ringColor = { urgent: '#FF7A6B', soon: '#FFC960', ok: '#5FD39A' } as const;
const heroPill = {
  urgent: { bg: 'rgba(255,122,107,.16)', fg: '#FF9C90' },
  soon: { bg: 'rgba(255,201,96,.16)', fg: '#FFC960' },
  ok: { bg: 'rgba(95,211,154,.16)', fg: '#7BE0B0' },
} as const;

export function DocumentsScreen() {
  const { t, days, longDate } = useI18n();
  const { docs, settings, push, openPaywall, setTab } = useApp();

  // Рахуємо дні й статуси, сортуємо: найтерміновіший зверху
  const items = useMemo(() => {
    const today = new Date();
    return docs
      .map((d) => {
        const left = daysLeft(d.validUntil, today);
        return { ...d, left, status: statusFor(left), reminder: nextReminder(d.validUntil, today) };
      })
      .sort((a, b) => a.left - b.left);
  }, [docs]);

  function startScan() {
    if (!settings.unlockAll && docs.length >= FREE_LIMIT) openPaywall();
    else push({ name: 'scan' });
  }

  const hero = items[0];
  const heroType = hero ? documentTypes[hero.type] : null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn delay={50} style={styles.header}>
          <View>
            <Text style={styles.date}>{longDate(new Date())}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {t('docs.title')}
            </Text>
          </View>
          <Pressable onPress={() => setTab('settings')} accessibilityRole="button" accessibilityLabel={t('docs.settings')} style={styles.iconBtn}>
            <Icon name="sliders" size={20} color={colors.text} />
          </Pressable>
        </FadeIn>

        {hero && heroType && (
          <FadeIn delay={150}>
            <Pressable accessibilityRole="button" onPress={() => push({ name: 'detail', docId: hero.id })} style={styles.hero}>
              <ProgressRing days={hero.left} unit={t('docs.days')} color={ringColor[hero.status]} />
              <View style={styles.heroInfo}>
                <View style={[styles.heroPill, { backgroundColor: heroPill[hero.status].bg }]}>
                  <View style={[styles.dot, { backgroundColor: ringColor[hero.status] }]} />
                  <Text style={[styles.heroPillText, { color: heroPill[hero.status].fg }]}>
                    {hero.left < 0 ? t('status.expired') : t(`status.${hero.status}` as const)}
                  </Text>
                </View>
                <Text style={styles.heroTitle}>{t(heroType.title)}</Text>
                <Text style={styles.heroSub}>{t('docs.validUntil', { date: formatDate(hero.validUntil) })}</Text>
                {hero.reminder && (
                  <Text style={styles.heroReminder}>{t('docs.nextReminder', { date: hero.reminder })}</Text>
                )}
              </View>
            </Pressable>
          </FadeIn>
        )}

        <FadeIn delay={250} style={styles.listHeader}>
          <Text style={styles.h2} accessibilityRole="header">
            {t('docs.all')}
          </Text>
          <Text style={styles.counter}>
            {settings.unlockAll ? t('docs.counter', { n: items.length }) : t('docs.freeCounter', { n: items.length, max: FREE_LIMIT })}
          </Text>
        </FadeIn>

        <View style={styles.list}>
          {items.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>{t('docs.empty')}</Text>
              <Text style={styles.empty}>{t('docs.emptyHint')}</Text>
            </View>
          )}
          {items.map((d, i) => {
            const type = documentTypes[d.type];
            const c = statusColors[d.status];
            return (
              <FadeIn key={d.id} delay={350 + i * 100} distance={14}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => push({ name: 'detail', docId: d.id })}
                  style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: c.bg }]}>
                    <Icon name={type.icon} size={22} color={c.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{t(type.title)}</Text>
                    <Text style={styles.rowSub}>
                      {t(type.subtitle) !== t(type.title) ? `${t(type.subtitle)} · ` : ''}
                      {t('docs.until', { date: formatDate(d.validUntil) })}
                    </Text>
                  </View>
                  <StatusPill status={d.status} label={days(d.left)} />
                </Pressable>
              </FadeIn>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          onPress={startScan}
          accessibilityRole="button"
          style={({ pressed }) => [styles.scan, pressed && { opacity: 0.88 }]}
        >
          <Icon name="scan" size={22} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.scanText}>{t('docs.scan')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 16 },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  title: { marginTop: 6, fontFamily: fonts.heading, fontSize: 26, color: colors.text, letterSpacing: -0.26 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    marginTop: 22,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: radius.hero,
    backgroundColor: colors.dark,
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    boxShadow: '0 18px 36px rgba(20,22,27,.22)',
  },
  heroInfo: { flex: 1, gap: 8 },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  heroPillText: { fontFamily: fonts.extrabold, fontSize: 12 },
  heroTitle: { fontFamily: fonts.extrabold, fontSize: 18, lineHeight: 22, color: '#FFFFFF' },
  heroSub: { fontFamily: fonts.regular, fontSize: 13, color: '#C9CCD8' },
  heroReminder: { fontFamily: fonts.bold, fontSize: 12, color: '#8EA2FF' },
  listHeader: {
    paddingTop: 26,
    paddingBottom: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  h2: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text },
  counter: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  list: { paddingHorizontal: 20, gap: 10 },
  emptyBox: { alignItems: 'center', padding: 24, gap: 6 },
  emptyTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.text },
  rowSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  bottom: { backgroundColor: colors.bg, paddingTop: 8 },
  scan: {
    marginHorizontal: 20,
    marginBottom: 14,
    height: 60,
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: '0 12px 28px rgba(35,64,217,.4)',
  },
  scanText: { fontFamily: fonts.extrabold, fontSize: 17, color: '#FFFFFF' },
});
