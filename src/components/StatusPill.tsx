import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, Status, statusColors } from '../theme';

/** Статус завжди: колір + текст. */
export function StatusPill({ status, label }: { status: Status; label: string }) {
  const c = statusColors[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  text: { fontFamily: fonts.extrabold, fontSize: 12 },
});
