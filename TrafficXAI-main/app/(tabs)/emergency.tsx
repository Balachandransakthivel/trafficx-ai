// TRAFFICX AI — Emergency Response
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AmbulanceCard } from '@/components/feature/AmbulanceCard';
import { RouteCard } from '@/components/feature/RouteCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SimulationPanel } from '@/components/feature/SimulationPanel';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function Emergency() {
  const { vehicles, routes, signals, simulation, activateGreenCorridor } = useTraffic();
  const [routeVisible, setRouteVisible] = useState(false);

  const activeVehicles = vehicles.filter(v => v.status !== 'STANDBY');
  const corridorSignals = signals.filter(s => s.greenCorridor);

  return (
    <ScreenShell title="EMERGENCY">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Emergency Header */}
        <View style={[styles.emergencyBanner, simulation.ambulanceDeployed && styles.emergencyBannerActive]}>
          <Text style={styles.emergencyIcon}>🚑</Text>
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

        {/* Vehicles */}
        <SectionHeader
          title="Emergency Fleet"
          subtitle={`${vehicles.length} total · ${activeVehicles.length} active`}
        />
        {vehicles.map(v => <AmbulanceCard key={v.id} vehicle={v} />)}

        {/* Green Corridor Status */}
        {simulation.greenCorridorActive ? (
          <View style={styles.corridorCard}>
            <View style={styles.corridorHeader}>
              <Text style={styles.corridorTitle}>🚦 GREEN CORRIDOR ACTIVE</Text>
              <Text style={styles.corridorSub}>Priority route cleared for AMB-001</Text>
            </View>
            <View style={styles.corridorJunctions}>
              {corridorSignals.map((s, i) => (
                <View key={s.id} style={styles.corridorStep}>
                  <View style={styles.corridorDot} />
                  <Text style={styles.corridorJunction}>{s.junctionName.split('–')[1]?.trim() || s.junctionName}</Text>
                  <Text style={styles.corridorStatus}>🟢 GREEN</Text>
                  {i < corridorSignals.length - 1 ? (
                    <View style={styles.corridorLine} />
                  ) : null}
                </View>
              ))}
              <View style={styles.corridorStep}>
                <View style={[styles.corridorDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.corridorJunction}>Government Hospital</Text>
                <Text style={styles.corridorStatus}>🏥 DESTINATION</Text>
              </View>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={activateGreenCorridor}
            style={({ pressed }) => [styles.corridorBtn, pressed && { opacity: 0.8 }]}
          >
            <MaterialIcons name="traffic" size={20} color={Colors.green} />
            <Text style={styles.corridorBtnText}>ACTIVATE GREEN CORRIDOR</Text>
            <MaterialIcons name="chevron-right" size={18} color={Colors.green} />
          </Pressable>
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
              subtitle="AI-weighted cost algorithm: Distance×0.4 + Traffic×0.4 + Risk×0.2"
            />
            {routes.map(r => <RouteCard key={r.id} route={r} />)}
          </>
        ) : null}

        {/* Simulation */}
        <SectionHeader title="Demo Controls" subtitle="Hackathon simulation" />
        <SimulationPanel />

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
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
  },
  emergencyBannerActive: {
    borderColor: `${Colors.emergency}44`,
    backgroundColor: `${Colors.emergency}08`,
  },
  emergencyIcon: { fontSize: 32 },
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
  corridorCard: {
    backgroundColor: `${Colors.green}10`,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: `${Colors.green}44`,
    gap: Spacing.md,
  },
  corridorHeader: { gap: 2 },
  corridorTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.green, letterSpacing: 0.5 },
  corridorSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
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
    backgroundColor: Colors.green,
    borderWidth: 2, borderColor: Colors.greenBg,
  },
  corridorJunction: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  corridorStatus: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green },
  corridorLine: {
    position: 'absolute',
    left: 5.5,
    top: '100%',
    width: 1,
    height: Spacing.base,
    backgroundColor: `${Colors.green}44`,
  },
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
  bottom: { height: Spacing.xl },
});
