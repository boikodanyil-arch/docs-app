import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppContext';
import { Icon } from '../components/Icon';
import { FadeIn } from '../components/motion';
import { PrimaryButton } from '../components/ui';
import { FREE_LIMIT } from '../data/testDocuments';
import { useI18n } from '../i18n';
import { info } from '../lib/dialog';
import { colors, fonts } from '../theme';

type Plan = 'year' | 'month' | 'life';
// Ціни ще не вирішені (див. plan.pdf, «Що ще вирішити»). Покупки підключимо на етапі 5.
const PRICE = '—';

export function PaywallSheet() {
  const { t } = useI18n();
  const { docs, closePaywall } = useApp();
  const [plan, setPlan] = useState<Plan>('year');

  const plans: { id: Plan; title: string; sub: string; price: string; badge?: string }[] = [
    { id: 'year', title: t('paywall.year'), sub: t('paywall.yearSub'), price: t('paywall.perYear', { p: PRICE }), badge: t('paywall.best') },
    { id: 'month', title: t('paywall.month'), sub: t('paywall.monthSub'), price: t('paywall.perMonth', { p: PRICE }) },
    { id: 'life', title: t('paywall.life'), sub: t('paywall.lifeSub'), price: PRICE },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.dim} onPress={closePaywall} accessibilityLabel={t('common.close')} />
      <FadeIn distance={40} style={styles.sheet}>
        <View style={styles.grab} />
        <View style={styles.head}>
          <View style={styles.headIcon}>
            <Icon name="filePlus" size={26} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} accessibilityRole="header">
              {t('paywall.title', { n: docs.length + 1 })}
            </Text>
            <Text style={styles.sub}>{t('paywall.subtitle', { max: FREE_LIMIT })}</Text>
          </View>
        </View>

        <View style={styles.bullets}>
          {(['paywall.b1', 'paywall.b2', 'paywall.b3'] as const).map((k) => (
            <View key={k} style={styles.bullet}>
              <Icon name="check" size={18} color="#1B6B45" strokeWidth={3} />
              <Text style={styles.bulletText}>{t(k)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          {plans.map((p) => {
            const on = p.id === plan;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPlan(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={[styles.plan, on && styles.planOn]}
              >
                <View style={[styles.radio, on && styles.radioOn]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>{p.title}</Text>
                  <Text style={styles.planSub}>{p.sub}</Text>
                </View>
                {p.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                )}
                <Text style={styles.planPrice}>{p.price}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 18 }}>
          <PrimaryButton label={t('paywall.continue')} onPress={() => info(t('paywall.soonTitle'), t('paywall.soonText'))} />
        </View>
        <Pressable onPress={closePaywall} accessibilityRole="button" style={styles.notNow}>
          <Text style={styles.notNowText}>{t('paywall.notNow')}</Text>
        </Pressable>
        <Text style={styles.fine}>{t('paywall.cancelInfo')}</Text>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,18,32,.55)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: 34,
  },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D9D8D1', alignSelf: 'center' },
  head: { marginTop: 22, flexDirection: 'row', gap: 14, alignItems: 'center' },
  headIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#E4E9FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 25, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  bullets: { marginTop: 18, gap: 8 },
  bullet: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  bulletText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  planOn: { borderColor: colors.accent, backgroundColor: '#F2F4FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C9C8C0', backgroundColor: '#FFFFFF' },
  radioOn: { borderWidth: 7, borderColor: colors.accent },
  planTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.text },
  planSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#1B6B45' },
  badgeText: { fontFamily: fonts.extrabold, fontSize: 11, color: '#FFFFFF' },
  planPrice: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.text },
  notNow: { marginTop: 6, height: 44, alignItems: 'center', justifyContent: 'center' },
  notNowText: { fontFamily: fonts.bold, fontSize: 15, color: colors.textSecondary },
  fine: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
});
