import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Icon } from '../components/Icon';
import { FadeIn } from '../components/motion';
import { documentTypes } from '../data/documentTypes';
import { useI18n } from '../i18n';
import { ensureNotificationPermission, hasNotificationPermission, reminderDate } from '../lib/reminders';
import { formatDate, statusFor, daysLeft } from '../lib/status';
import { colors, fonts, radius, statusColors } from '../theme';

export function RemindersScreen() {
  const { t, days } = useI18n();
  const { docs, push, rescheduleAll } = useApp();
  const [allowed, setAllowed] = useState(true);
  const isWeb = Platform.OS === 'web';

  const refresh = useCallback(() => {
    if (!isWeb) hasNotificationPermission().then(setAllowed).catch(() => {});
  }, [isWeb]);
  useEffect(refresh, [refresh]);

  const items = useMemo(() => {
    const now = Date.now();
    return docs
      .flatMap((d) =>
        d.reminders.map((o) => ({ doc: d, offset: o, when: reminderDate(d.validUntil, o) })),
      )
      .filter((x) => x.when.getTime() > now)
      .sort((a, b) => a.when.getTime() - b.when.getTime());
  }, [docs]);

  async function enable() {
    const ok = await ensureNotificationPermission();
    if (ok) {
      setAllowed(true);
      await rescheduleAll();
    } else {
      Linking.openSettings();
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {t('rem.title')}
          </Text>
          <Text style={styles.subtitle}>{t('rem.subtitle')}</Text>
        </FadeIn>

        {isWeb && <Text style={styles.web}>{t('rem.webNote')}</Text>}

        {!allowed && !isWeb && (
          <View style={styles.banner}>
            <Icon name="bell" size={22} color="#8A5300" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>{t('rem.deniedTitle')}</Text>
              <Text style={styles.bannerText}>{t('rem.deniedText')}</Text>
            </View>
            <Pressable onPress={enable} accessibilityRole="button" style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>{t('rem.enable')}</Text>
            </Pressable>
          </View>
        )}

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" size={34} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>{t('rem.empty')}</Text>
            <Text style={styles.emptyText}>{t('rem.emptyHint')}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((it, i) => {
              const type = documentTypes[it.doc.type];
              const c = statusColors[statusFor(daysLeft(it.doc.validUntil))];
              const iso = `${it.when.getFullYear()}-${String(it.when.getMonth() + 1).padStart(2, '0')}-${String(it.when.getDate()).padStart(2, '0')}`;
              return (
                <FadeIn key={`${it.doc.id}-${it.offset}`} delay={Math.min(i, 8) * 60} distance={12}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => push({ name: 'detail', docId: it.doc.id })}
                    style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: c.bg }]}>
                      <Icon name={type.icon} size={22} color={c.fg} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{t(type.title)}</Text>
                      <Text style={styles.rowSub}>{t('rem.before', { d: days(it.offset) })}</Text>
                    </View>
                    <Text style={styles.rowDate}>{formatDate(iso)}</Text>
                  </Pressable>
                </FadeIn>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 24 },
  header: { paddingTop: 56, paddingHorizontal: 24 },
  title: { fontFamily: fonts.heading, fontSize: 26, color: colors.text, letterSpacing: -0.26 },
  subtitle: { marginTop: 6, fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  web: { marginHorizontal: 24, marginTop: 14, fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  banner: {
    marginTop: 18,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: '#FFF3DC',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bannerTitle: { fontFamily: fonts.extrabold, fontSize: 14, color: '#8A5300' },
  bannerText: { fontFamily: fonts.regular, fontSize: 12, color: '#8A5300', marginTop: 2 },
  bannerBtn: { minHeight: 44, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#8A5300', alignItems: 'center', justifyContent: 'center' },
  bannerBtnText: { fontFamily: fonts.extrabold, fontSize: 13, color: '#FFFFFF' },
  list: { marginTop: 20, paddingHorizontal: 20, gap: 10 },
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
  rowDate: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  empty: { marginTop: 80, alignItems: 'center', paddingHorizontal: 40, gap: 8 },
  emptyTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text, marginTop: 6 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
