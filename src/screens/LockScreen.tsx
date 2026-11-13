import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { useI18n } from '../i18n';
import { colors, fonts, radius } from '../theme';

/** Екран блокування: Face ID, а якщо він недоступний — код телефона. */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);

  const auth = useCallback(async () => {
    setFailed(false);
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: t('set.lockReason') });
    if (res.success) onUnlock();
    else setFailed(true);
  }, [onUnlock, t]);

  useEffect(() => {
    auth().catch(() => setFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.iconBox}>
        <Icon name="lock" size={34} color="#8EA2FF" />
      </View>
      <Text style={styles.title}>{t('lock.title')}</Text>
      {failed && <Text style={styles.failed}>{t('lock.failed')}</Text>}
      <Pressable onPress={() => auth().catch(() => setFailed(true))} accessibilityRole="button" style={styles.btn}>
        <Text style={styles.btnText}>{t('lock.button')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.welcome, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  iconBox: { width: 76, height: 76, borderRadius: 24, backgroundColor: 'rgba(142,162,255,.14)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 20, color: '#FFFFFF', textAlign: 'center' },
  failed: { fontFamily: fonts.regular, fontSize: 13, color: '#FF9C90' },
  btn: { marginTop: 8, height: 56, minWidth: 220, paddingHorizontal: 24, borderRadius: radius.button, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.extrabold, fontSize: 17, color: '#FFFFFF' },
});
