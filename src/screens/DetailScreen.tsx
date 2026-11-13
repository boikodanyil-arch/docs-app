import * as Calendar from 'expo-calendar/legacy';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/ui';
import { documentTypes } from '../data/documentTypes';
import { useI18n } from '../i18n';
import { ask, info } from '../lib/dialog';
import { reminderDate } from '../lib/reminders';
import { daysLeft, formatDate, shortDate, statusFor, toDate } from '../lib/status';
import { colors, fonts, radius, statusColors } from '../theme';

export function DetailScreen({ docId }: { docId: string }) {
  const { t, days } = useI18n();
  const { docs, pop, push, removeDocument, openPaywall, settings } = useApp();
  const [menu, setMenu] = useState(false);
  const [viewer, setViewer] = useState(false);
  const doc = docs.find((d) => d.id === docId);
  if (!doc) return <View style={styles.root} />;

  const type = documentTypes[doc.type];
  const left = daysLeft(doc.validUntil);
  const status = statusFor(left);
  const c = statusColors[status];
  const now = Date.now();

  // Часова шкала нагадувань
  const offsets = [...doc.reminders].sort((a, b) => b - a);
  let nextFound = false;
  const steps = offsets.map((o) => {
    const when = reminderDate(doc.validUntil, o);
    const sent = when.getTime() <= now;
    const isNext = !sent && !nextFound;
    if (isNext) nextFound = true;
    return { o, when, sent, isNext };
  });

  async function addToCalendar() {
    if (Platform.OS === 'web' || !doc) return;
    try {
      const perm = await Calendar.requestCalendarPermissionsAsync();
      if (!perm.granted) return info(t('detail.calendarDenied'));
      const cal = await Calendar.getDefaultCalendarAsync();
      const start = toDate(doc.validUntil);
      await Calendar.createEventAsync(cal.id, {
        title: `${t(type.title)}: ${t('detail.expiry').toLowerCase()}`,
        startDate: start,
        endDate: start,
        allDay: true,
        alarms: [{ relativeOffset: -7 * 24 * 60 }, { relativeOffset: -24 * 60 }],
        notes: t('detail.disclaimer'),
      });
      info(t('detail.calendarDone'));
    } catch {
      info(t('detail.calendarError'));
    }
  }

  async function sharePhoto() {
    if (!doc?.photoUri) return;
    try {
      if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) return;
      await Sharing.shareAsync(doc.photoUri);
    } catch {
      info(t('detail.shareError'));
    }
  }

  async function remove() {
    setMenu(false);
    const yes = await ask({
      title: t('detail.deleteTitle'),
      message: t('detail.deleteText'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!yes) return;
    await removeDocument(doc!.id);
    pop();
  }

  const progress = Math.max(0, Math.min(1, left / 60));

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <IconButton icon="chevronLeft" label={t('common.back')} onPress={pop} />
        <IconButton icon="dots" label={t('detail.menu')} onPress={() => setMenu(true)} size={20} strokeWidth={2} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.cardIcon, { backgroundColor: c.bg }]}>
              <Icon name={type.icon} size={24} color={c.fg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t(type.title)}</Text>
              {t(type.subtitle) !== t(type.title) && <Text style={styles.cardSub}>{t(type.subtitle)}</Text>}
            </View>
          </View>

          <View style={styles.big}>
            <Text style={[styles.bigNum, { color: c.fg }]}>{Math.max(0, left)}</Text>
            <Text style={styles.bigText}>{left < 0 ? t('detail.expired') : t('detail.daysLeft')}</Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: c.fg }]} />
          </View>

          <View style={styles.dates}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>{t('detail.issued')}</Text>
              <Text style={styles.dateValue}>{doc.issuedAt ? formatDate(doc.issuedAt) : '—'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>{t('detail.valid')}</Text>
              <Text style={styles.dateValue}>{formatDate(doc.validUntil)}</Text>
            </View>
          </View>
          {doc.note ? (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.dateLabel}>{t('detail.note')}</Text>
              <Text style={styles.dateValue}>{doc.note}</Text>
            </View>
          ) : null}
        </View>

        {doc.photoUri && (
          <View style={{ marginHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.h2}>{t('detail.photo')}</Text>
            <Pressable onPress={() => setViewer(true)} accessibilityRole="imagebutton" accessibilityLabel={t('detail.photo')}>
              <Image source={{ uri: doc.photoUri }} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
            </Pressable>
          </View>
        )}

        <Text style={[styles.h2, { marginHorizontal: 24, marginTop: 24, marginBottom: 12 }]}>{t('detail.reminders')}</Text>
        <View style={styles.timeline}>
          <View style={styles.line} />
          <View style={{ gap: 16 }}>
            {steps.map((s) => (
              <View key={s.o} style={styles.step}>
                {s.sent ? (
                  <View style={[styles.dotBase, { backgroundColor: '#1B6B45' }]}>
                    <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                ) : s.isNext ? (
                  <View style={[styles.dotBase, { backgroundColor: colors.accent, borderWidth: 4, borderColor: '#DDE3FF' }]} />
                ) : (
                  <View style={[styles.dotBase, { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C9C8C0' }]} />
                )}
                <Text style={[styles.stepTitle, s.isNext && { fontFamily: fonts.extrabold, color: colors.accent }]}>
                  {t('detail.before', { d: days(s.o) })}
                </Text>
                <Text style={[styles.stepDate, s.isNext && { fontFamily: fonts.bold, color: colors.accent }]}>
                  {s.sent
                    ? t('detail.sent', { date: shortDate(s.when) })
                    : s.isNext
                      ? t('detail.next', { date: shortDate(s.when) })
                      : shortDate(s.when)}
                </Text>
              </View>
            ))}
            <View style={styles.step}>
              <View style={[styles.dotBase, { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#B42318' }]} />
              <Text style={styles.stepTitle}>{t('detail.expiry')}</Text>
              <Text style={[styles.stepDate, { color: '#B42318', fontFamily: fonts.bold }]}>{formatDate(doc.validUntil)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => push({ name: 'scan', renewOf: doc.id })}
          style={({ pressed }) => [styles.renew, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.renewText}>{t('detail.renew')}</Text>
        </Pressable>
        {Platform.OS !== 'web' && (
          <Pressable accessibilityRole="button" onPress={addToCalendar} style={({ pressed }) => [styles.cal, pressed && { opacity: 0.85 }]}>
            <Icon name="calendar" size={18} color={colors.text} />
            <Text style={styles.calText}>{t('detail.calendar')}</Text>
          </Pressable>
        )}
        <Text style={styles.disclaimer}>{t('detail.disclaimer')}</Text>
      </View>

      {viewer && doc.photoUri && (
        <View style={styles.viewer}>
          <Image source={{ uri: doc.photoUri }} style={StyleSheet.absoluteFill} resizeMode="contain" accessibilityIgnoresInvertColors />
          <View style={styles.viewerTop}>
            <Pressable onPress={() => setViewer(false)} accessibilityRole="button" accessibilityLabel={t('common.close')} style={styles.viewerBtn}>
              <Icon name="close" size={20} color="#FFFFFF" />
            </Pressable>
            {Platform.OS !== 'web' && (
              <Pressable onPress={sharePhoto} accessibilityRole="button" accessibilityLabel={t('detail.share')} style={[styles.viewerBtn, { paddingHorizontal: 16, width: undefined }]}>
                <Text style={styles.viewerText}>{t('detail.share')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {menu && (
        <View style={styles.menuOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenu(false)} accessibilityLabel={t('common.close')} />
          <View style={styles.menu}>
            <Pressable
              accessibilityRole="button"
              style={styles.menuItem}
              onPress={() => {
                setMenu(false);
                push({ name: 'confirm', photoUri: doc.photoUri, recognized: null, docId: doc.id });
              }}
            >
              <Icon name="pencil" size={20} color={colors.text} />
              <Text style={styles.menuText}>{t('detail.edit')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.menuItem} onPress={remove}>
              <Icon name="trash" size={20} color="#B42318" />
              <Text style={[styles.menuText, { color: '#B42318' }]}>{t('common.delete')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingTop: 54, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { paddingBottom: 12 },
  card: {
    marginTop: 18,
    marginHorizontal: 20,
    padding: 22,
    borderRadius: radius.hero,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHead: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  cardIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text },
  cardSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  big: { marginTop: 22, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bigNum: { fontFamily: fonts.heading, fontSize: 48, lineHeight: 54 },
  bigText: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  bar: { marginTop: 14, height: 8, borderRadius: 4, backgroundColor: '#F1F0EA', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  dates: { marginTop: 16, flexDirection: 'row', gap: 12 },
  dateLabel: { fontFamily: fonts.bold, fontSize: 12, color: colors.textSecondary },
  dateValue: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.text, marginTop: 2 },
  photo: { marginTop: 10, height: 180, borderRadius: radius.card, backgroundColor: '#E6E8EF' },
  h2: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text },
  timeline: { marginHorizontal: 24 },
  line: { position: 'absolute', left: 9, top: 10, bottom: 10, width: 2, backgroundColor: '#D9D8D1' },
  step: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  dotBase: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  stepDate: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 34, gap: 10 },
  renew: {
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: radius.button,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(35,64,217,.35)',
  },
  renewText: { fontFamily: fonts.extrabold, fontSize: 16, color: '#FFFFFF', textAlign: 'center' },
  cal: {
    height: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calText: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.text },
  disclaimer: { marginTop: 4, fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  viewer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#07080C' },
  viewerTop: { position: 'absolute', top: 54, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  viewerBtn: { height: 44, minWidth: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' },
  viewerText: { fontFamily: fonts.extrabold, fontSize: 14, color: '#FFFFFF' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  menu: {
    position: 'absolute',
    top: 104,
    right: 20,
    minWidth: 200,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 18px 36px rgba(20,22,27,.18)',
    overflow: 'hidden',
  },
  menuItem: { minHeight: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
});
