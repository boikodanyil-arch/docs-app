import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fonts } from '../theme';

const R = 52;
const C = 2 * Math.PI * R; // ≈ 326.7

/** Кільце з днями. fill — скільки "лишилось" (0..1) від умовного запасу в 60 днів. */
export function ProgressRing({ days, unit, color }: { days: number; unit: string; color: string }) {
  const fill = Math.max(0, Math.min(1, days / 60));
  return (
    <View style={styles.wrap}>
      <Svg width={120} height={120} viewBox="0 0 120 120" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={60} cy={60} r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={10} />
        <Circle
          cx={60}
          cy={60}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fill)}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.num}>{Math.max(0, days)}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 120, height: 120 },
  center: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 38, color: '#FFFFFF' },
  unit: { fontFamily: fonts.regular, fontSize: 12, color: '#C9CCD8', marginTop: 4 },
});
