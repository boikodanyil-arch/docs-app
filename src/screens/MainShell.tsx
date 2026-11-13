import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tab, useApp } from '../AppContext';
import { Icon, IconName } from '../components/Icon';
import { useI18n } from '../i18n';
import { colors, fonts } from '../theme';
import { DocumentsScreen } from './DocumentsScreen';
import { RemindersScreen } from './RemindersScreen';
import { SettingsScreen } from './SettingsScreen';

const tabs: { id: Tab; icon: IconName; label: 'nav.docs' | 'nav.reminders' | 'nav.settings' }[] = [
  { id: 'docs', icon: 'file', label: 'nav.docs' },
  { id: 'reminders', icon: 'bell', label: 'nav.reminders' },
  { id: 'settings', icon: 'gear', label: 'nav.settings' },
];

export function MainShell() {
  const { t } = useI18n();
  const { tab, setTab } = useApp();
  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        {tab === 'docs' && <DocumentsScreen />}
        {tab === 'reminders' && <RemindersScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <View style={styles.nav} accessibilityLabel={t('nav.label')}>
        {tabs.map((x) => {
          const active = x.id === tab;
          const color = active ? colors.accent : colors.textSecondary;
          return (
            <Pressable
              key={x.id}
              onPress={() => setTab(x.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={styles.item}
            >
              <Icon name={x.icon} size={22} color={color} />
              <Text style={[styles.text, { color, fontFamily: active ? fonts.extrabold : fonts.bold }]}>{t(x.label)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  nav: {
    height: 82,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    backgroundColor: 'rgba(255,255,255,.85)',
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 4, minHeight: 44 },
  text: { fontSize: 11 },
});
