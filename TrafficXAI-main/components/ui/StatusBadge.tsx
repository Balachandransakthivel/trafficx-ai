import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrafficStatus } from '@/types/traffic';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Props {
  status: TrafficStatus | string;
  compact?: boolean;
}

const STATUS_CONFIG = {
  LOW: { label: 'LOW', color: Colors.green, bg: Colors.greenBg },
  MEDIUM: { label: 'MEDIUM', color: Colors.yellow, bg: Colors.yellowBg },
  HIGH: { label: 'HIGH', color: Colors.orange, bg: '#f9731618' },
  CRITICAL: { label: 'CRITICAL', color: Colors.red, bg: Colors.redBg },
  ACTIVE: { label: 'ACTIVE', color: Colors.red, bg: Colors.redBg },
  RESOLVED: { label: 'RESOLVED', color: Colors.green, bg: Colors.greenBg },
  MONITORING: { label: 'MONITORING', color: Colors.yellow, bg: Colors.yellowBg },
  STANDBY: { label: 'STANDBY', color: Colors.textSecondary, bg: '#8892a418' },
  EMERGENCY: { label: 'EMERGENCY', color: Colors.emergency, bg: Colors.emergencyBg },
  EN_ROUTE: { label: 'EN ROUTE', color: Colors.primary, bg: Colors.primaryDim },
  ARRIVED: { label: 'ARRIVED', color: Colors.green, bg: Colors.greenBg },
};

export const StatusBadge = memo(({ status, compact = false }: Props) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: status, color: Colors.textSecondary, bg: '#8892a418',
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, compact && styles.compact]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }, compact && styles.compactLabel]}>
        {config.label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  compactLabel: {
    fontSize: 10,
  },
});
