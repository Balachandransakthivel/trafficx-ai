import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Incident } from '@/types/traffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getStatusColor } from '@/services/mockData';

const INCIDENT_ICONS = {
  ACCIDENT: '🚨',
  CONGESTION: '🚗',
  ROAD_BLOCK: '🚧',
  VEHICLE_BREAKDOWN: '🔧',
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

interface Props {
  incident: Incident;
  onPress?: () => void;
  onResolve?: () => void;
}

export const IncidentCard = memo(({ incident, onPress, onResolve }: Props) => {
  const color = getStatusColor(incident.severity);

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{INCIDENT_ICONS[incident.type]}</Text>
        <View style={styles.info}>
          <Text style={styles.type}>{incident.type.replace('_', ' ')}</Text>
          <Text style={styles.location}>{incident.location}</Text>
        </View>
        <View style={styles.meta}>
          <StatusBadge status={incident.status} compact />
          <Text style={styles.time}>{timeAgo(incident.timestamp)}</Text>
        </View>
      </View>

      <Text style={styles.desc}>{incident.description}</Text>

      <View style={styles.footer}>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>Severity</Text>
          <Text style={[styles.chipValue, { color }]}>{incident.severity}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>Impact</Text>
          <Text style={[styles.chipValue, { color: getStatusColor(incident.trafficImpact) }]}>{incident.trafficImpact}</Text>
        </View>
      </View>
    </Pressable>
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
    borderLeftWidth: 3,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  icon: { fontSize: 22, marginTop: 2 },
  info: { flex: 1, gap: 2 },
  type: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.3 },
  location: { fontSize: FontSize.sm, color: Colors.textSecondary },
  meta: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: 10, color: Colors.textMuted },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  footer: { flexDirection: 'row', gap: Spacing.md },
  chip: { gap: 2 },
  chipLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.5, fontWeight: FontWeight.medium },
  chipValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
