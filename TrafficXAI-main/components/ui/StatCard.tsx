import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  subtitle?: string;
  flex?: number;
}

export const StatCard = memo(({ label, value, icon, color = Colors.primary, subtitle, flex = 1 }: Props) => (
  <View style={[styles.card, { flex }]}>
    <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 18 },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
