import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts } from '../theme';
import { Icon, IconName } from './Icon';

/** Квадратна кнопка-іконка 44×44 (як у прототипі). */
export function IconButton({
  icon,
  label,
  onPress,
  size = 20,
  strokeWidth = 2.2,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
    >
      <Icon name={icon} size={size} color={colors.text} strokeWidth={strokeWidth} />
    </Pressable>
  );
}

export function Field({
  label,
  highlight,
  style,
  ...input
}: { label: string; highlight?: boolean } & TextInputProps) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={[styles.label, highlight && { color: colors.accent }]}>{label}</Text>
      <TextInput
        {...input}
        placeholderTextColor="#9AA1B4"
        style={[styles.input, highlight && styles.inputHl]}
        accessibilityLabel={label}
      />
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
    >
      <Text style={[styles.chipText, { color: on ? '#FFFFFF' : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  height = 58,
  disabled,
}: {
  label: string;
  onPress: () => void;
  height?: number;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.primary, { height }, (pressed || disabled) && { opacity: 0.8 }]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSecondary },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  inputHl: { borderWidth: 2, borderColor: colors.accent, fontFamily: fonts.extrabold },
  chip: { flex: 1, height: 48, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chipOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  chipOff: { borderColor: colors.borderStrong, backgroundColor: colors.card },
  chipText: { fontFamily: fonts.extrabold, fontSize: 15 },
  primary: {
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(35,64,217,.35)',
  },
  primaryText: { fontFamily: fonts.extrabold, fontSize: 17, color: '#FFFFFF' },
});
