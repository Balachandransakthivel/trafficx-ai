// TRAFFICX AI — Emergency Response
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteCard } from '@/components/feature/RouteCard';
import { SimulationPanel } from '@/components/feature/SimulationPanel';

export default function Emergency() {
  const { vehicles, routes, signals, simulation, activateGreenCorridor, sendAmbulance } = useTraffic();
  const [routeVisible, setRouteVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [greenCorridorProgress, setGreenCorridorProgress] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const corridorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (simulation.ambulanceDeployed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [simulation.ambulanceDeployed]);

  useEffect(() => {
    if (simulation.greenCorridorActive) {
      Animated.timing(corridorAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
      setGreenCorridorProgress(100);
    } else {
      setGreenCorridorProgress(0);
      corridorAnim.setValue(0);
    }
  }, [simulation.greenCorridorActive]);

  const activeVehicles = vehicles.filter(v => v.status !== 'STANDBY');
  const corridorSignals = signals.filter(s => s.greenCorridor);

  const handleStartEmergency = () => {
    sendAmbulance();
    setTimeout(() => {
      setRouteVisible(true);
    }, 500);
  };

  const handleActivateCorridor = () => {
    activateGreenCorridor();
  };

  return (
    <ScreenShell title="EMERGENCY">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Emergency Header */}
        <View style={[styles.emergencyBanner, simulation.ambulanceDeployed && styles.emergencyBannerActive]}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.emergencyIconWrap}>
            <Text style={styles.emergencyIcon}>🚑</Text>
          </View>
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>EMERGENCY RESPONSE</Text>
            <Text style={styles.emergencySub}>
              {activeVehicles.length > 0
                ? `${activeVehicles.length} unit(s) active — system coordinating`
                : 'No active emergencies — all units on standby'}
            </Text>
          </View>
          <View style={[styles.emergencyCount, activeVehicles.length > 0 && styles.emergencyCountActive]}>
            <Text style={styles.emergencyCountText}>{activeVehicles.length}</Text>
          </View>
        </View>

        {/* Active Ambulances */}
        <SectionHeader
          title="Active Fleet"
          subtitle={`${vehicles.length} total · ${activeVehicles.length} deployed`}
        />
        {vehicles.map(v => (
          <AmbulanceCard 
            key={v.id} 
            vehicle={v} 
            onPress={() => setSelectedVehicle(v)}
            selected={selectedVehicle?.id === v.id}
          />
        ))}

        {/* Selected Vehicle Detail */}
        {selectedVehicle && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{selectedVehicle.vehicleId}</Text>
              <Pressable onPress={() => setSelectedVehicle(null)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color={Colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.detailValueRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColorForVehicle(selectedVehicle.status) }]} />
                  <Text style={styles.detailValue}>{selectedVehicle.status}</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Speed</Text>
                <Text style={styles.detailValue}>{selectedVehicle.speed} km/h</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>ETA</Text>
                <Text style={styles.detailValue}>{selectedVehicle.eta} min</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{selectedVehicle.routeId ? '8.2 km' : '—'}</Text>
              </View>
            </View>
            <View style={styles.detailRoute}>
              <Text style={styles.detailLabel}>Route</Text>
              <Text style={styles.detailValue}>{selectedVehicle.destination}</Text>
            </View>
          </View>
        )}

        {/* Green Corridor Status */}
        {simulation.greenCorridorActive ? (
          <View style={styles.corridorCard}>
            <View style={styles.corridorHeader}>
              <Animated.View style={[styles.corridorPulse, { opacity: corridorAnim }]} />
              <Text style={styles.corridorTitle}>🚦 GREEN CORRIDOR ACTIVE</Text>
              <Text style={styles.corridorSub}>Priority route cleared for {activeVehicles[0]?.vehicleId || 'AMB-001'}</Text>
            </View>
            
            <View style={styles.corridorProgress}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { width: `${greenCorridorProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{greenCorridorProgress}% corridor established</Text>
            </View>

            <View style={styles.corridorJunctions}>
              {corridorSignals.map((s, i) => (
                <View key={s.id} style={styles.corridorStep}>
                  <View
                    style={[
                      styles.corridorDot,
                      s.greenCorridor && { backgroundColor: Colors.green }
                    ]}
                  />
                  <Text style={styles.corridorJunction}>{s.junctionName.split('–')[1]?.trim() || s.junctionName}</Text>
                  <Text style={[styles.corridorStatus, s.greenCorridor && styles.corridorStatusGreen]}>
                    {s.greenCorridor ? '🟢 GREEN' : '🔴 RED'}
                  </Text>
                  {i < corridorSignals.length - 1 ? (
                    <View
                      style={[
                        styles.corridorLine,
                        s.greenCorridor && styles.corridorLineActive
                      ]}
                    />
                  ) : null}
                </View>
              ))}
              <View style={styles.corridorStep}>
                <View style={[styles.corridorDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.corridorJunction}>Government Hospital</Text>
                <Text style={styles.corridorStatusGreen}>🏥 DESTINATION</Text>
              </View>
            </View>

            <Pressable onPress={handleActivateCorridor} style={styles.deactivateBtn}>
              <MaterialIcons name="traffic" size={20} color={Colors.red} />
              <Text style={styles.deactivateBtnText}>DEACTIVATE CORRIDOR</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            {activeVehicles.length > 0 ? (
              <Pressable onPress={handleActivateCorridor} style={styles.corridorBtn}>
                <MaterialIcons name="traffic" size={20} color={Colors.green} />
                <Text style={styles.corridorBtnText}>ACTIVATE GREEN CORRIDOR</Text>
                <MaterialIcons name="chevron-right" size={18} color={Colors.green} />
              </Pressable>
            ) : (
              <Pressable onPress={handleStartEmergency} style={styles.startEmergencyBtn}>
                <MaterialIcons name="local-hospital" size={20} color={Colors.emergency} />
                <Text style={styles.startEmergencyBtnText}>START EMERGENCY</Text>
                <MaterialIcons name="chevron-right" size={18} color={Colors.emergency} />
              </Pressable>
            )}
          </View>
        )}

        {/* Route Optimizer */}
        <Pressable
          onPress={() => setRouteVisible(!routeVisible)}
          style={({ pressed }) => [styles.routeToggle, pressed && { opacity: 0.8 }]}
        >
          <MaterialIcons name="alt-route" size={20} color={Colors.primary} />
          <Text style={styles.routeToggleText}>
            {routeVisible ? 'HIDE ROUTE OPTIMIZER' : 'FIND OPTIMAL ROUTE'}
          </Text>
          <MaterialIcons name={routeVisible ? 'expand-less' : 'expand-more'} size={20} color={Colors.primary} />
        </Pressable>

        {routeVisible ? (
          <>
            <SectionHeader
              title="Route Comparison"
              subtitle="AI-weighted cost: Distance×0.4 + Traffic×0.4 + Risk×0.2"
            />
            <View style={styles.routeLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.legendText}>Recommended (Lowest Cost)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.yellow }]} />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.red }]} />
                <Text style={styles.legendText}>Blocked</Text>
              </View>
            </View>
            {routes.map(r => <RouteCard key={r.id} route={r} />)}
          </>
        ) : null}

        {/* Simulation Controls */}
        <SectionHeader title="Demo Controls" subtitle="Hackathon simulation" />
        <SimulationPanel />

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

function AmbulanceCard({ vehicle, onPress, selected }: { vehicle: any; onPress: () => void; selected: boolean }) {
  const statusColors: Record<string, string> = {
    STANDBY: '#64748b',
    EMERGENCY: Colors.emergency,
    EN_ROUTE: Colors.primary,
    ARRIVED: Colors.green,
  };
  const statusEmoji: Record<string, string> = {
    STANDBY: '🟢',
    EMERGENCY: '🚨',
    EN_ROUTE: '🚑',
    ARRIVED: '✅',
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.vehicleCard, selected && styles.vehicleCardSelected, pressed && styles.vehicleCardPressed]}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIdWrap}>
          <Text style={styles.vehicleEmoji}>{statusEmoji[vehicle.status] || '🚑'}</Text>
          <View style={styles.vehicleIdGroup}>
            <Text style={styles.vehicleId}>{vehicle.vehicleId}</Text>
            <Text style={styles.vehicleType}>{vehicle.type}</Text>
          </View>
        </View>
        <View style={[styles.vehicleStatusBadge, { backgroundColor: `${statusColors[vehicle.status] || Colors.textMuted}22` }]}>
          <View style={[styles.statusDotSmall, { backgroundColor: statusColors[vehicle.status] || Colors.textMuted }]} />
          <Text style={[styles.vehicleStatus, { color: statusColors[vehicle.status] || Colors.textMuted }]}>
            {vehicle.status}
          </Text>
        </View>
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={14} color={Colors.textMuted} />
          <Text style={styles.detailText}>{vehicle.currentLocation}</Text>
        </View>
        {vehicle.destination && (
          <View style={styles.detailRow}>
            <MaterialIcons name="flag" size={14} color={Colors.primary} />
            <Text style={styles.detailText}>{vehicle.destination}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <MaterialIcons name="speed" size={14} color={Colors.yellow} />
          <Text style={styles.detailText}>Speed: {vehicle.speed} km/h</Text>
        </View>
        {vehicle.eta > 0 && (
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={14} color={Colors.green} />
            <Text style={styles.detailText}>ETA: {vehicle.eta} min</Text>
          </View>
        )}
      </View>

      {vehicle.routeId && (
        <View style={styles.routeInfo}>
          <MaterialIcons name="alt-route" size={12} color={Colors.primary} />
          <Text style={styles.routeInfoText}>Route: {vehicle.routeId} • Distance: 8.2 km</Text>
        </View>
      )}
    </Pressable>
  );
}

function getStatusColorForVehicle(status: string): string {
  switch (status) {
    case 'STANDBY': return '#64748b';
    case 'EMERGENCY': return Colors.emergency;
    case 'EN_ROUTE': return Colors.primary;
    case 'ARRIVED': return Colors.green;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  emergencyBannerActive: {
    borderColor: `${Colors.emergency}44`,
    backgroundColor: `${Colors.emergency}08`,
  },
  pulseRing: {
    position: 'absolute',
    left: -20,
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.emergency,
    opacity: 0.3,
  },
  emergencyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.emergencyBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emergencyIcon: { fontSize: 24 },
  emergencyText: { flex: 1 },
  emergencyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emergencySub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
  emergencyCount: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  emergencyCountActive: { borderColor: Colors.emergency, backgroundColor: Colors.emergencyBg },
  emergencyCountText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  vehicleCardSelected: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.primaryDim },
  vehicleCardPressed: { opacity: 0.8 },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleIdWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  vehicleEmoji: { fontSize: 24 },
  vehicleIdGroup: { gap: 2 },
  vehicleId: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vehicleType: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  vehicleStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  vehicleStatus: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  vehicleDetails: { gap: Spacing.xs },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  routeInfo: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  routeInfoText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  detailCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  closeBtn: { padding: Spacing.xs },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 2,
  },
  detailLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  detailValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  detailRoute: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  corridorCard: {
    backgroundColor: `${Colors.green}10`,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: `${Colors.green}44`,
    gap: Spacing.md,
  },
  corridorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  corridorPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  corridorTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.green, letterSpacing: 0.5, flex: 1 },
  corridorSub: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  corridorProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  progressText: { fontSize: FontSize.xs, color: Colors.green, fontWeight: '600', minWidth: 120 },
  corridorJunctions: { gap: 0 },
  corridorStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  corridorDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.textMuted,
    borderWidth: 2, borderColor: Colors.surfaceElevated,
  },
  corridorJunction: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  corridorStatus: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textMuted },
  corridorStatusGreen: { color: Colors.green },
  corridorLine: {
    position: 'absolute',
    left: 5.5,
    top: '100%',
    width: 1,
    height: Spacing.base,
    backgroundColor: Colors.border,
  },
  corridorLineActive: { backgroundColor: Colors.green },
  deactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.redBg,
    borderWidth: 1,
    borderColor: `${Colors.red}44`,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  deactivateBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.red,
    letterSpacing: 0.8,
  },
  actionButtons: { gap: Spacing.sm },
  corridorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.greenBg,
    borderWidth: 1,
    borderColor: `${Colors.green}44`,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
  corridorBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.green,
    letterSpacing: 0.8,
  },
  startEmergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emergencyBg,
    borderWidth: 1,
    borderColor: `${Colors.emergency}44`,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
  startEmergencyBtnText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.emergency,
    letterSpacing: 0.8,
  },
  routeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryDim,
    borderWidth: 1,
    borderColor: `${Colors.primary}44`,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  routeToggleText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  routeLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  bottom: { height: Spacing.xl },
});