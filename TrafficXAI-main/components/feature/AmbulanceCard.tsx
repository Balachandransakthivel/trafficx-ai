import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmergencyVehicle } from '@/types/traffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';

const VEHICLE_ICONS = { AMBULANCE: '🚑', FIRE: '🚒', POLICE: '🚓' };

interface Props {
  vehicle: EmergencyVehicle;
}

export const AmbulanceCard = memo(({ vehicle }: Props) => {
  const isActive = vehicle.status === 'EMERGENCY' || vehicle.status === 'EN_ROUTE';

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{VEHICLE_ICONS[vehicle.type]}</Text>
        <View style={styles.info}>
          <Text style={styles.vehicleId}>{vehicle.vehicleId}</Text>
          <Text style={styles.driver}>{vehicle.driverName}</Text>
        </View>
        <StatusBadge status={vehicle.status} compact />
      </View>

      {isActive ? (
        <View style={styles.routeInfo}>
          <View style={styles.routeRow}>
            <Text style={styles.routeLabel}>📍 From</Text>
            <Text style={styles.routeValue}>{vehicle.currentLocation}</Text>
          </View>
          <View style={[styles.routeDivider]} />
          <View style={styles.routeRow}>
            <Text style={styles.routeLabel}>🏥 To</Text>
            <Text style={styles.routeValue}>{vehicle.destination}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{vehicle.speed}</Text>
          <Text style={styles.statLabel}>km/h</Text>
        </View>
        {isActive ? (
          <>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{vehicle.eta}</Text>
              <Text style={styles.statLabel}>min ETA</Text>
            </View>
          </>
        ) : null}
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: isActive ? Colors.emergency : Colors.textMuted }]}>
            {isActive ? 'ACTIVE' : 'STANDBY'}
          </Text>
          <Text style={styles.statLabel}>status</Text>
        </View>
      </View>
    </View>
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
  },
  cardActive: {
    borderColor: `${Colors.emergency}44`,
    backgroundColor: `${Colors.emergency}08`,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  vehicleId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  driver: { fontSize: FontSize.xs, color: Colors.textSecondary },
  routeInfo: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  routeLabel: { fontSize: FontSize.xs, color: Colors.textMuted, width: 60 },
  routeValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, flex: 1 },
  routeDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 70 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.4 },
  divider: { width: 1, height: 30, backgroundColor: Colors.border },
});
