import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lang, useI18n } from '../i18n';
import { colors, fonts } from '../theme';

export function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <View style={styles.row}>
      {(['uk', 'pl'] as Lang[]).map((l) => {
        const on = l === lang;
        return (
          <Pressable
            key={l}
            onPress={() => setLang(l)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            hitSlop={6}
            style={[styles.btn, on ? styles.on : styles.off]}
          >
            <Text style={[styles.text, { color: on ? colors.welcome : colors.white }]}>{l === 'uk' ? 'UA' : 'PL'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  btn: { height: 32, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center' },
  on: { backgroundColor: colors.white },
  off: { borderWidth: 1, borderColor: 'rgba(255,255,255,.25)' },
  text: { fontFamily: fonts.bold, fontSize: 13 },
});
