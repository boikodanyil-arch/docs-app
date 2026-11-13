import React from 'react';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { LangSwitch } from '../components/LangSwitch';
import { FadeIn, Float } from '../components/motion';
import { Key, useI18n } from '../i18n';
import { colors, fonts, radius } from '../theme';

const features: { icon: IconName; text: Key }[] = [
  { icon: 'scan', text: 'welcome.feature1' },
  { icon: 'clock', text: 'welcome.feature2' },
  { icon: 'lock', text: 'welcome.feature3' },
];

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none">
        <Svg width={420} height={420}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#2340D9" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#0F1220" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={420} height={420} fill="url(#glow)" />
        </Svg>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Плаваючі картки */}
        <View style={styles.cards} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Float style={[styles.card, styles.cardLease]} amplitude={10} duration={6000}>
            <Text style={styles.cardLabel}>UMOWA NAJMU</Text>
            <View style={[styles.bar, { width: 120, marginTop: 18 }]} />
            <View style={[styles.bar, { width: 90, marginTop: 8, opacity: 0.8 }]} />
            <View style={styles.leasePill}>
              <Text style={styles.leasePillText}>58 днів</Text>
            </View>
          </Float>

          <Float style={[styles.card, styles.cardPobyt]} amplitude={14} duration={7000}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>KARTA POBYTU</Text>
            <View style={styles.pobytRow}>
              <View style={styles.photo} />
              <View style={{ gap: 6 }}>
                <View style={[styles.bar2, { width: 80 }]} />
                <View style={[styles.bar2, { width: 56, backgroundColor: '#E6E8EF' }]} />
              </View>
            </View>
            <Text style={styles.pobytValid}>{t('welcome.cardValid')}</Text>
          </Float>

          <Float style={[styles.card, styles.cardNotify]} amplitude={8} duration={5500}>
            <View style={styles.bellBox}>
              <Icon name="bell" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifyTitle}>{t('welcome.cardExpires')}</Text>
              <Text style={styles.notifySub}>{t('welcome.cardIn')}</Text>
            </View>
          </Float>
        </View>

        <View style={styles.body}>
          <FadeIn delay={150}>
            <Text style={styles.h1} accessibilityRole="header">
              {t('welcome.title1')}
              {'\n'}
              {t('welcome.title2')}
              {'\n'}
              <Text style={{ color: '#8EA2FF' }}>{t('welcome.title3')}</Text>
            </Text>
          </FadeIn>

          <View style={{ gap: 14 }}>
            {features.map((f, i) => (
              <FadeIn key={f.text} delay={300 + i * 150}>
                <View style={styles.feature}>
                  <Icon name={f.icon} size={20} color="#8EA2FF" />
                  <Text style={styles.featureText}>{t(f.text)}</Text>
                </View>
              </FadeIn>
            ))}
          </View>
        </View>
      </ScrollView>

      <FadeIn delay={750} style={styles.footer}>
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>{t('welcome.start')}</Text>
          <Icon name="arrow" size={18} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.footerRow}>
          <LangSwitch />
          <Text style={styles.disclaimer}>{t('welcome.disclaimer')}</Text>
        </View>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.welcome, overflow: 'hidden' },
  glow: { position: 'absolute', left: -40, top: -60 },
  scroll: { flexGrow: 1 },
  cards: { height: 380, width: 390, alignSelf: 'center' },
  card: { position: 'absolute', borderRadius: 18, padding: 16 },
  cardLease: {
    left: 34,
    top: 120,
    width: 190,
    height: 124,
    backgroundColor: '#1C2140',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
    transform: [{ rotate: '-7deg' }],
  },
  cardLabel: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.9, color: '#AEB6D6' },
  bar: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.14)' },
  leasePill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#3A2A06',
  },
  leasePillText: { fontFamily: fonts.bold, fontSize: 11, color: '#FFC960' },
  cardPobyt: {
    right: 26,
    top: 70,
    width: 170,
    height: 112,
    backgroundColor: colors.bg,
    transform: [{ rotate: '6deg' }],
  },
  pobytRow: { marginTop: 14, flexDirection: 'row', gap: 10, alignItems: 'center' },
  photo: { width: 34, height: 42, borderRadius: 6, backgroundColor: '#D9DCE6' },
  bar2: { height: 6, borderRadius: 3, backgroundColor: '#D9DCE6' },
  pobytValid: { marginTop: 12, fontFamily: fonts.bold, fontSize: 11, color: '#1B6B45' },
  cardNotify: {
    left: 96,
    top: 238,
    width: 210,
    height: 108,
    borderRadius: 20,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  bellBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyTitle: { fontFamily: fonts.extrabold, fontSize: 13, color: '#FFFFFF' },
  notifySub: { fontFamily: fonts.regular, fontSize: 12, color: '#DDE3FF', marginTop: 4 },
  body: { paddingTop: 8, paddingHorizontal: 28, gap: 22, flexGrow: 1 },
  h1: { fontFamily: fonts.heading, fontSize: 30, lineHeight: 35, color: '#FFFFFF', letterSpacing: -0.3 },
  feature: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  featureText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: '#D7DBEA' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30, gap: 14 },
  cta: {
    height: 56,
    borderRadius: radius.button,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 10px 24px rgba(35,64,217,.4)',
  },
  ctaText: { fontFamily: fonts.extrabold, fontSize: 17, color: '#FFFFFF' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  disclaimer: { fontFamily: fonts.regular, fontSize: 12, color: '#9AA1BB' },
});
