import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrafficRoad } from '@/types/traffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getStatusColor } from '@/services/mockData';

interface Props {
  road: TrafficRoad;
}

export const RoadStatusCard = memo(({ road }: Props) => {
  const barColor = getStatusColor(road.status);
  const barWidth = `${road.density}%`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Text style={styles.roadName}>{road.name}</Text>
          <Text style={styles.vehicleCount}>{road.vehicleCount} vehicles</Text>
        </View>
        <StatusBadge status={road.status} compact />
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: barWidth as any, backgroundColor: barColor }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.densityLabel}>Density</Text>
        <Text style={[styles.densityValue, { color: barColor }]}>{road.density}%</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  left: { flex: 1 },
  roadName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  vehicleCount: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  barBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  densityLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  densityValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
