import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Route } from '@/types/traffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getStatusColor } from '@/services/mockData';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  route: Route;
  onPress?: () => void;
}

export const RouteCard = memo(({ route, onPress }: Props) => {
  const color = getStatusColor(route.trafficStatus);

  return (
    <Pressable onPress={onPress} style={[styles.card, route.recommended && styles.recommendedCard, route.blocked && styles.blockedCard]}>
      {route.recommended ? (
        <View style={styles.recommendedBadge}>
          <MaterialIcons name="star" size={10} color="#fff" />
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      ) : null}
      {route.blocked ? (
        <View style={styles.blockedBadge}>
          <Text style={styles.blockedText}>BLOCKED</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <Text style={styles.routeName}>{route.name}</Text>
        <Text style={[styles.cost, { color: route.recommended ? Colors.green : route.blocked ? Colors.red : Colors.yellow }]}>
          Score: {route.cost}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{route.distance} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{route.duration} min</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <StatusBadge status={route.trafficStatus} compact />
          <Text style={styles.statLabel}>Traffic</Text>
        </View>
      </View>

      <View style={styles.waypointsRow}>
        {route.waypoints.map((wp, i) => (
          <View key={wp} style={styles.wpItem}>
            <View style={[styles.wpDot, route.recommended && { backgroundColor: Colors.green }]} />
            <Text style={styles.wpLabel}>{wp}</Text>
            {i < route.waypoints.length - 1 ? (
              <View style={[styles.wpLine, route.recommended && { backgroundColor: Colors.green }]} />
            ) : null}
          </View>
        ))}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  recommendedCard: { borderColor: `${Colors.green}55`, backgroundColor: `${Colors.green}08` },
  blockedCard: { borderColor: `${Colors.red}44`, opacity: 0.7 },
  recommendedBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.green,
    paddingHorizontal: 8, paddingVertical: 3,
    borderBottomLeftRadius: Radius.sm,
    flexDirection: 'row', gap: 3, alignItems: 'center',
  },
  recommendedText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  blockedBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.red,
    paddingHorizontal: 8, paddingVertical: 3,
    borderBottomLeftRadius: Radius.sm,
  },
  blockedText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  routeName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1 },
  cost: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  stats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted },
  divider: { width: 1, height: 36, backgroundColor: Colors.border },
  waypointsRow: { flexDirection: 'row', alignItems: 'center' },
  wpItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  wpDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  wpLabel: { fontSize: 10, color: Colors.textSecondary, marginLeft: 3 },
  wpLine: { flex: 1, height: 1.5, backgroundColor: Colors.border, marginHorizontal: 4 },
});
