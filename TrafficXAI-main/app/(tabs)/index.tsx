// TRAFFICX AI — Dashboard (Main Screen with Live Interactive Map)
import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable, Animated, Platform
} from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { StatCard } from '@/components/ui/StatCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SimulationPanel } from '@/components/feature/SimulationPanel';
import { RoadStatusCard } from '@/components/feature/RoadStatusCard';
import { IncidentCard } from '@/components/feature/IncidentCard';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

const MAP_TILES = {
  dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
};

const CITY_CENTER = { latitude: 11.005, longitude: 77.008, latitudeDelta: 0.045, longitudeDelta: 0.045 };

function DashboardLiveMap() {
  const router = useRouter();
  const { roads, incidents, vehicles, signals, simulation } = useTraffic();
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

  const activeVehicles = vehicles.filter(v => v.status !== 'STANDBY');
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE');

  return (
    <View style={mapStyles.container}>
      {/* Real Map View */}
      <MapView
        style={mapStyles.map}
        initialRegion={CITY_CENTER}
        showsUserLocation={false}
        zoomEnabled={true}
        scrollEnabled={false}
        mapType="none"
        provider={PROVIDER_DEFAULT}
      >
        <UrlTile
          urlTemplate={MAP_TILES.dark}
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />

        {/* Roads Polyline */}
        {roads.map(road => (
          <Polyline
            key={road.id}
            coordinates={[
              { latitude: road.fromLat, longitude: road.fromLng },
              { latitude: road.toLat, longitude: road.toLng },
            ]}
            strokeColor={road.status === 'CRITICAL' ? Colors.red : road.status === 'HIGH' ? Colors.orange : Colors.green}
            strokeWidth={3}
          />
        ))}

        {/* Incidents */}
        {activeIncidents.map(incident => (
          <Marker key={incident.id} coordinate={{ latitude: incident.lat, longitude: incident.lng }} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={mapStyles.incidentDot}>
              <Text style={mapStyles.emojiSmall}>🚨</Text>
            </View>
          </Marker>
        ))}

        {/* Ambulances */}
        {activeVehicles.map(vehicle => (
          <Marker key={vehicle.id} coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }} anchor={{ x: 0.5, y: 0.5 }}>
            <Animated.View style={[mapStyles.ambulanceMarker, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={mapStyles.emojiSmall}>🚑</Text>
            </Animated.View>
          </Marker>
        ))}

        {/* Hospital */}
        <Marker coordinate={{ latitude: 11.0100, longitude: 77.0155 }} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={mapStyles.hospitalMarker}>
            <Text style={mapStyles.emojiSmall}>🏥</Text>
          </View>
        </Marker>
      </MapView>

      {/* Top Banner Overlay */}
      <View style={mapStyles.topOverlay}>
        <View style={mapStyles.liveBadge}>
          <View style={mapStyles.liveDot} />
          <Text style={mapStyles.liveText}>LIVE CITY MAP</Text>
        </View>
        {simulation.greenCorridorActive && (
          <View style={mapStyles.corridorBadge}>
            <Text style={mapStyles.corridorText}>🟢 CORRIDOR ACTIVE</Text>
          </View>
        )}
      </View>

      {/* Bottom Action Button */}
      <Pressable onPress={() => router.push('/(tabs)/live-traffic')} style={mapStyles.bottomOverlay}>
        <Text style={mapStyles.fullMapButtonText}>VIEW FULL INTERACTIVE MAP</Text>
        <MaterialIcons name="arrow-forward" size={16} color="#fff" />
      </Pressable>
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

        {/* Live Map Card */}
        <SectionHeader
          title="Live Traffic Map"
          subtitle="Real-time city overview & signals"
          actionLabel="Full Map →"
          onAction={() => router.push('/(tabs)/live-traffic')}
        />
        <DashboardLiveMap />

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
    height: 240,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    backgroundColor: '#0a0c10',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10,12,16,0.85)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  liveText: { fontSize: 9, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 0.8 },
  corridorBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  corridorText: { fontSize: 9, fontWeight: '800', color: Colors.green },
  bottomOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(17,21,32,0.92)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary,
    zIndex: 2,
  },
  fullMapButtonText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  incidentDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  ambulanceMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  hospitalMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  emojiSmall: { fontSize: 12 },
});

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  cityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cityStatusNormal: {
    backgroundColor: '#22c55e12',
    borderColor: '#22c55e33',
  },
  cityStatusWarning: {
    backgroundColor: '#f59e0b12',
    borderColor: '#f59e0b33',
  },
  cityStatusCritical: {
    backgroundColor: '#ef444415',
    borderColor: '#ef444444',
  },
  cityStatusIcon: { fontSize: 28 },
  cityStatusText: { flex: 1, gap: 2 },
  cityStatusTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  cityStatusSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  alertDot: {
    backgroundColor: Colors.red,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  alertDotText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickBtn: {
    width: '31%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  bottomSpace: { height: 40 },
});
