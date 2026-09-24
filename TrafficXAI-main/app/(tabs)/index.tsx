// TRAFFICX AI — Dashboard (Main Screen)
import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable, Animated
} from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SimulationPanel } from '@/components/feature/SimulationPanel';
import { RoadStatusCard } from '@/components/feature/RoadStatusCard';
import { IncidentCard } from '@/components/feature/IncidentCard';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

function LiveMapPlaceholder() {
  const { simulation, vehicles } = useTraffic();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (simulation.ambulanceDeployed || simulation.greenCorridorActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [simulation.ambulanceDeployed, simulation.greenCorridorActive]);

  return (
    <View style={mapStyles.container}>
      <Image
        source={require('@/assets/images/hero_map.png')}
        style={mapStyles.mapImage}
        contentFit="cover"
        transition={300}
      />
      <View style={mapStyles.overlay}>
        {/* Road Status Indicators */}
        <View style={mapStyles.roadRow}>
          <View style={[mapStyles.roadChip, { borderColor: Colors.red }]}>
            <Text style={[mapStyles.roadText, { color: Colors.red }]}>🔴 Avinashi Rd</Text>
          </View>
          <View style={[mapStyles.roadChip, { borderColor: Colors.yellow }]}>
            <Text style={[mapStyles.roadText, { color: Colors.yellow }]}>🟡 Trichy Rd</Text>
          </View>
        </View>

        {/* Center Map View */}
        <View style={mapStyles.center}>
          {simulation.accidentTriggered ? (
            <View style={mapStyles.incidentMarker}>
              <Text style={mapStyles.markerEmoji}>🚨</Text>
              <Text style={mapStyles.markerLabel}>Junction 4</Text>
            </View>
          ) : null}

          {simulation.greenCorridorActive ? (
            <View style={mapStyles.corridorPath}>
              <Text style={mapStyles.corridorEmoji}>🟢━━🟢━━🟢</Text>
              <Text style={mapStyles.corridorLabel}>GREEN CORRIDOR ACTIVE</Text>
            </View>
          ) : null}

          {(simulation.ambulanceDeployed || simulation.scenarioStep >= 3) ? (
            <Animated.View style={[mapStyles.ambulanceMarker, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={mapStyles.ambulanceEmoji}>🚑</Text>
              <Text style={mapStyles.ambulanceLabel}>AMB-001</Text>
            </Animated.View>
          ) : null}
        </View>

        {/* Hospital */}
        <View style={mapStyles.hospitalChip}>
          <Text style={mapStyles.roadText}>🏥 Govt Hospital</Text>
        </View>

        {/* Live Indicator */}
        <View style={mapStyles.liveChip}>
          <View style={mapStyles.liveDot} />
          <Text style={mapStyles.liveText}>LIVE MAP</Text>
        </View>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { roads, incidents, vehicles, simulation, alerts } = useTraffic();

  const normalRoads = roads.filter(r => r.status === 'LOW' || r.status === 'MEDIUM').length;
  const congestedRoads = roads.filter(r => r.status === 'HIGH' || r.status === 'CRITICAL').length;
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE').length;
  const emergencyVehicles = vehicles.filter(v => v.status !== 'STANDBY').length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <ScreenShell title="TRAFFICX AI">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* City Status Banner */}
        <View style={[
          styles.cityStatus,
          simulation.accidentTriggered ? styles.cityStatusCritical :
          simulation.trafficSurge ? styles.cityStatusWarning : styles.cityStatusNormal
        ]}>
          <Text style={styles.cityStatusIcon}>
            {simulation.accidentTriggered ? '🚨' : simulation.trafficSurge ? '⚠️' : '✅'}
          </Text>
          <View style={styles.cityStatusText}>
            <Text style={styles.cityStatusTitle}>
              {simulation.accidentTriggered ? 'INCIDENT ACTIVE' :
               simulation.trafficSurge ? 'TRAFFIC SURGE' : 'CITY STATUS NORMAL'}
            </Text>
            <Text style={styles.cityStatusSub}>
              {simulation.greenCorridorActive
                ? 'Green corridor active — AMB-001 en route'
                : `${normalRoads} roads clear · ${congestedRoads} congested`}
            </Text>
          </View>
          {unreadAlerts > 0 ? (
            <View style={styles.alertDot}>
              <Text style={styles.alertDotText}>{unreadAlerts}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Normal Roads" value={normalRoads}
            icon="🟢" color={Colors.green}
          />
          <StatCard
            label="Congested" value={congestedRoads}
            icon="🔴" color={Colors.red}
          />
          <StatCard
            label="Incidents" value={activeIncidents}
            icon="🚨" color={Colors.emergency}
          />
          <StatCard
            label="Emergency" value={emergencyVehicles}
            icon="🚑" color={Colors.yellow}
          />
        </View>

        {/* Live Map */}
        <SectionHeader
          title="Live Traffic Map"
          subtitle="Real-time city overview"
          actionLabel="Full Map →"
          onAction={() => router.push('/(tabs)/live-traffic')}
        />
        <LiveMapPlaceholder />

        {/* Simulation Panel */}
        <SimulationPanel />

        {/* Active Incidents */}
        <SectionHeader
          title="Active Incidents"
          subtitle={`${activeIncidents} active · ${incidents.length} total`}
          actionLabel="View All →"
          onAction={() => router.push('/(tabs)/incidents')}
        />
        {incidents.filter(i => i.status === 'ACTIVE').slice(0, 2).map(incident => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}

        {/* Road Status */}
        <SectionHeader
          title="Road Status"
          subtitle="Live density & vehicle counts"
          actionLabel="View All →"
          onAction={() => router.push('/(tabs)/live-traffic')}
        />
        {roads.slice(0, 3).map(road => (
          <RoadStatusCard key={road.id} road={road} />
        ))}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" subtitle="Navigate to key modules" />
        <View style={styles.quickActions}>
          {[
            { label: 'Emergency', icon: '🚑', route: '/(tabs)/emergency', color: Colors.emergency },
            { label: 'AI Monitor', icon: '📹', route: '/(tabs)/ai-monitor', color: Colors.primary },
            { label: 'Routes', icon: '🗺️', route: '/(tabs)/routes', color: Colors.blue },
            { label: 'Signals', icon: '🚦', route: '/(tabs)/signals', color: Colors.green },
            { label: 'Predict', icon: '📈', route: '/(tabs)/predictions', color: Colors.yellow },
            { label: 'Analytics', icon: '📊', route: '/(tabs)/analytics', color: Colors.orange },
          ].map(action => (
            <Pressable
              key={action.label}
              onPress={() => router.push(action.route as any)}
              style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${action.color}22` }]}>
                <Text style={styles.quickEmoji}>{action.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </ScreenShell>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapImage: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,12,16,0.55)',
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  roadRow: { flexDirection: 'row', gap: Spacing.sm },
  roadChip: {
    backgroundColor: 'rgba(10,12,16,0.7)',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  roadText: { fontSize: FontSize.xs, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  incidentMarker: { alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.2)', padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.red },
  markerEmoji: { fontSize: 24 },
  markerLabel: { fontSize: 10, color: Colors.red, fontWeight: '700' },
  corridorPath: { alignItems: 'center', gap: 2 },
  corridorEmoji: { fontSize: 18 },
  corridorLabel: { fontSize: 9, color: Colors.green, fontWeight: '800', letterSpacing: 1 },
  ambulanceMarker: { alignItems: 'center' },
  ambulanceEmoji: { fontSize: 32 },
  ambulanceLabel: { fontSize: 10, color: Colors.emergency, fontWeight: '700' },
  hospitalChip: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(10,12,16,0.7)',
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  liveChip: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(10,12,16,0.8)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.green,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  liveText: { fontSize: 9, fontWeight: '800', color: Colors.green, letterSpacing: 0.8 },
});

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  cityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cityStatusNormal: { backgroundColor: Colors.greenBg, borderColor: `${Colors.green}44` },
  cityStatusWarning: { backgroundColor: Colors.yellowBg, borderColor: `${Colors.yellow}44` },
  cityStatusCritical: { backgroundColor: Colors.redBg, borderColor: `${Colors.red}44` },
  cityStatusIcon: { fontSize: 24 },
  cityStatusText: { flex: 1 },
  cityStatusTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  cityStatusSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  alertDot: {
    backgroundColor: Colors.red,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  alertDotText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickBtn: {
    width: '30%',
    flex: 1,
    minWidth: 90,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: FontWeight.semibold, textAlign: 'center' },
  bottomSpace: { height: Spacing.xl },
});
