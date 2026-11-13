import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Chip } from '../components/ui';
import { Lang, useI18n } from '../i18n';
import { ask, info } from '../lib/dialog';
import { ALL_OFFSETS, ensureNotificationPermission, hasNotificationPermission } from '../lib/reminders';
import { colors, fonts, radius } from '../theme';

export function SettingsScreen() {
  const { t, days, lang, setLang } = useI18n();
  const { settings, updateSetting, addTestDocuments, clearDocuments, rescheduleAll } = useApp();
  const [notif, setNotif] = useState(false);
  const isWeb = Platform.OS === 'web';

  const refresh = useCallback(() => {
    if (!isWeb) hasNotificationPermission().then(setNotif).catch(() => {});
  }, [isWeb]);
  useEffect(refresh, [refresh]);

  async function toggleLock(on: boolean) {
    if (!on) return updateSetting('lock', false);
    if (isWeb) return info(t('set.lockUnavailable'));
    const hw = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hw || !enrolled) return info(t('set.lockUnavailable'));
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: t('set.lockReason') });
    if (res.success) await updateSetting('lock', true);
  }

  async function toggleOffset(o: number) {
    const cur = settings.defaultReminders;
    const next = (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]).sort((a, b) => b - a);
    await updateSetting('defaultReminders', next);
  }

  async function notifPress() {
    if (isWeb || notif) return;
    const ok = await ensureNotificationPermission();
    setNotif(ok);
    if (ok) await rescheduleAll();
    else Linking.openSettings();
  }

  async function clearAll() {
    const yes = await ask({
      title: t('set.testClearConfirm'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (yes) await clearDocuments();
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title} accessibilityRole="header">
          {t('set.title')}
        </Text>

        <Section title={t('set.language')}>
          <View style={styles.langRow}>
            {(['uk', 'pl'] as Lang[]).map((l) => {
              const on = l === lang;
              return (
                <Pressable
                  key={l}
                  onPress={() => setLang(l)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.langBtn, on && styles.langOn]}
                >
                  <Text style={[styles.langText, on && { color: '#FFFFFF' }]}>{l === 'uk' ? 'Українська' : 'Polski'}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title={t('set.security')}>
          <Row title={t('set.lock')} hint={t('set.lockHint')}>
            <Switch value={settings.lock} onValueChange={toggleLock} trackColor={{ true: colors.accent }} />
          </Row>
        </Section>

        <Section title={t('set.defaultReminders')} hint={t('set.defaultRemindersHint')}>
          <View style={styles.chips}>
            {ALL_OFFSETS.map((o) => (
              <Chip key={o} label={days(o)} on={settings.defaultReminders.includes(o)} onPress={() => toggleOffset(o)} />
            ))}
          </View>
        </Section>

        {!isWeb && (
          <Section title={t('set.notifications')}>
            <Pressable onPress={notifPress} accessibilityRole="button">
              <Row title={notif ? t('set.notificationsOn') : t('set.notificationsOff')} />
            </Pressable>
          </Section>
        )}

        <Section title={t('set.privacy')}>
          <Text style={styles.text}>{t('set.privacyText')}</Text>
        </Section>

        <Section title={t('set.test')}>
          <Row title={t('set.testNoLimit')}>
            <Switch
              value={settings.unlockAll}
              onValueChange={(v) => updateSetting('unlockAll', v)}
              trackColor={{ true: colors.accent }}
            />
          </Row>
          <Pressable onPress={addTestDocuments} accessibilityRole="button" style={styles.linkBtn}>
            <Text style={styles.linkText}>{t('set.testAdd')}</Text>
          </Pressable>
          <Pressable onPress={clearAll} accessibilityRole="button" style={styles.linkBtn}>
            <Text style={[styles.linkText, { color: '#B42318' }]}>{t('set.testClear')}</Text>
          </Pressable>
        </Section>

        <Text style={styles.about}>{t('set.about')}</Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {hint && <Text style={styles.sectionHint}>{hint}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 32 },
  title: { paddingTop: 56, paddingHorizontal: 24, fontFamily: fonts.heading, fontSize: 26, color: colors.text, letterSpacing: -0.26 },
  section: { marginTop: 22, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.text, marginLeft: 4 },
  sectionHint: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginLeft: 4, marginTop: 2 },
  card: {
    marginTop: 10,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
  rowHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  langOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  langText: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.textSecondary },
  chips: { flexDirection: 'row', gap: 8 },
  linkBtn: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.accent },
  about: { marginTop: 24, textAlign: 'center', fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
});
