// TRAFFICX AI — Live Traffic Map (react-native-maps)
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Animated, ScrollView } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RoadStatusCard } from '@/components/feature/RoadStatusCard';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { getStatusColor } from '@/services/mockData';
import { TrafficStatus } from '@/types/traffic';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const MAP_TILES = {
  dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  voyager: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
};

const STATUS_EMOJI: Record<TrafficStatus, string> = {
  LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴',
};

const CITY_CENTER = { latitude: 11.005, longitude: 77.008, latitudeDelta: 0.035, longitudeDelta: 0.035 };

function RoadPolyline({ road, selected, onPress }: { road: any; selected: boolean; onPress: () => void }) {
  const color = getStatusColor(road.status);
  const width = selected ? 6 : 3.5;

  return (
    <Polyline
      coordinates={[
        { latitude: road.fromLat, longitude: road.fromLng },
        { latitude: road.toLat, longitude: road.toLng },
      ]}
      strokeColor={color}
      strokeWidth={width}
      tappable
      onPress={onPress}
    />
  );
}

function IncidentMarker({ incident, onPress }: { incident: any; onPress: () => void }) {
  const color = incident.severity === 'CRITICAL' ? Colors.red : incident.severity === 'HIGH' ? Colors.emergency : Colors.yellow;
  
  return (
    <Marker
      coordinate={{ latitude: incident.lat, longitude: incident.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
    >
      <View style={styles.incidentMarker}>
        <View style={[styles.markerDot, { backgroundColor: color }]}>
          <Text style={styles.markerEmoji}>🚨</Text>
        </View>
        <View style={styles.markerLabel}>
          <Text style={styles.markerLabelText}>{incident.location.split('–')[1]?.trim() || incident.location}</Text>
          <Text style={styles.markerSeverity}>{incident.severity}</Text>
        </View>
      </View>
    </Marker>
  );
}

function AmbulanceMarker({ vehicle }: { vehicle: any }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  return (
    <Marker
      coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
    >
      <View style={styles.ambulanceWrapper}>
        <Animated.View
          style={[
            styles.ambulancePulse,
            {
              opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
              transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
            },
          ]}
        />
        <View style={styles.ambulanceIcon}>
          <Text style={styles.ambulanceEmoji}>🚑</Text>
        </View>
        <View style={styles.ambulanceCallout}>
          <Text style={styles.calloutVehicleId}>{vehicle.vehicleId}</Text>
          <Text style={styles.calloutSpeed}>{vehicle.speed} km/h</Text>
          <Text style={styles.calloutEta}>ETA: {vehicle.eta} min</Text>
        </View>
      </View>
    </Marker>
  );
}

function HospitalMarker({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  return (
    <Marker coordinate={{ latitude: lat, longitude: lng }} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.hospitalMarker}>
        <Text style={styles.hospitalEmoji}>🏥</Text>
        <Text style={styles.hospitalName}>{name}</Text>
      </View>
    </Marker>
  );
}

function SignalMarker({ signal }: { signal: any }) {
  const color = signal.state === 'GREEN' ? Colors.green : signal.state === 'YELLOW' ? Colors.yellow : Colors.red;
  
  return (
    <Marker coordinate={{ latitude: signal.lat, longitude: signal.lng }} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.signalMarker}>
        <View style={[styles.signalDot, { backgroundColor: color }]} />
        {signal.greenCorridor && <View style={styles.corridorBadge}>🚦</View>}
        <Text style={styles.signalName}>{signal.junctionName.split('–')[1]?.trim() || signal.junctionName}</Text>
      </View>
    </Marker>
  );
}

export default function LiveTraffic() {
  const { roads, incidents, vehicles, signals } = useTraffic();
  const { routeId, routeName, waypoints, distance, duration } = useLocalSearchParams<{
    routeId?: string;
    routeName?: string;
    waypoints?: string;
    distance?: string;
    duration?: string;
  }>();
  
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<any>(null);
  const [showSignals, setShowSignals] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [tileLayer, setTileLayer] = useState<'dark' | 'osm' | 'voyager' | 'standard'>('dark');

  // Auto-select route when navigated from route optimizer
  useEffect(() => {
    if (routeId) {
      setSelectedRoadId(routeId);
      setTimeout(() => fitAllMarkers(), 500);
    }
  }, [routeId]);

  const cycleTileLayer = () => {
    const modes: Array<'dark' | 'osm' | 'voyager' | 'standard'> = ['dark', 'osm', 'voyager', 'standard'];
    const nextIdx = (modes.indexOf(tileLayer) + 1) % modes.length;
    setTileLayer(modes[nextIdx]);
  };

  const activeVehicles = vehicles.filter(v => v.status !== 'STANDBY');
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE');
  
  const grouped = useMemo(() => ({
    CRITICAL: roads.filter(r => r.status === 'CRITICAL'),
    HIGH: roads.filter(r => r.status === 'HIGH'),
    MEDIUM: roads.filter(r => r.status === 'MEDIUM'),
    LOW: roads.filter(r => r.status === 'LOW'),
  }), [roads]);

  const fitAllMarkers = () => {
    if (!mapRef) return;
    const coords = [
      ...roads.flatMap(r => [{ latitude: r.fromLat, longitude: r.fromLng }, { latitude: r.toLat, longitude: r.toLng }]),
      ...activeIncidents.map(i => ({ latitude: i.lat, longitude: i.lng })),
      ...activeVehicles.map(v => ({ latitude: v.lat, longitude: v.lng })),
      { latitude: 11.0100, longitude: 77.0155 },
    ];
    if (coords.length > 0) {
      if (typeof mapRef.fitToCoordinates === 'function') {
        mapRef.fitToCoordinates(coords, { edgePadding: { top: 80, right: 20, bottom: 100, left: 20 } });
      } else if (mapRef.current && typeof mapRef.current.fitToCoordinates === 'function') {
        mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 80, right: 20, bottom: 100, left: 20 } });
      }
    }
  };

  const renderMapView = () => (
    <MapView
      ref={setMapRef}
      style={isFullScreen ? styles.mapFullScreen : styles.mapInline}
      initialRegion={CITY_CENTER}
      showsUserLocation={false}
      showsMyLocationButton={true}
      zoomEnabled={true}
      scrollEnabled={true}
      pitchEnabled={false}
      rotateEnabled={false}
      toolbarEnabled={false}
      mapType={tileLayer === 'standard' ? 'standard' : 'none'}
      provider={PROVIDER_DEFAULT}
    >
      {tileLayer !== 'standard' && (
        <UrlTile
          urlTemplate={MAP_TILES[tileLayer]}
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />
      )}

      {roads.map(road => (
        <RoadPolyline
          key={road.id}
          road={road}
          selected={selectedRoadId === road.id}
          onPress={() => setSelectedRoadId(selectedRoadId === road.id ? null : road.id)}
        />
      ))}

      {showIncidents && activeIncidents.map(incident => (
        <IncidentMarker key={incident.id} incident={incident} onPress={() => {}} />
      ))}

      {activeVehicles.map(vehicle => (
        <AmbulanceMarker key={vehicle.id} vehicle={vehicle} />
      ))}

      {showHospitals && (
        <HospitalMarker lat={11.0100} lng={77.0155} name="Government Hospital" />
      )}

      {showSignals && signals.map(signal => (
        <SignalMarker key={signal.id} signal={signal} />
      ))}
    </MapView>
  );

  return (
    <ScreenShell title="LIVE TRAFFIC MAP">
      {isFullScreen ? (
        // Full Screen Map View
        <View style={styles.fullScreenContainer}>
          {renderMapView()}

          {/* Map Controls Overlay */}
          <View style={styles.mapControls}>
            <Pressable onPress={() => setIsFullScreen(false)} style={[styles.controlBtn, styles.controlBtnActive]}>
              <MaterialIcons name="fullscreen-exit" size={16} color="#fff" />
              <Text style={styles.controlBtnText}>EXIT FULLSCREEN</Text>
            </Pressable>
            <Pressable onPress={cycleTileLayer} style={styles.controlBtn}>
              <Text style={styles.controlBtnText}>🗺️ {tileLayer.toUpperCase()}</Text>
            </Pressable>
            <Pressable onPress={fitAllMarkers} style={styles.controlBtn}>
              <Text style={styles.controlBtnText}>⌖ Fit All</Text>
            </Pressable>
          </View>

          {/* Selected Road Info Card */}
          {selectedRoadId && (
            <View style={styles.selectedRoadCard}>
              <Pressable onPress={() => setSelectedRoadId(null)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color={Colors.textMuted} />
              </Pressable>
              {routeName && (
                <View style={styles.navInfoBanner}>
                  <View style={styles.navInfoHeader}>
                    <MaterialIcons name="navigation" size={16} color={Colors.primary} />
                    <Text style={styles.navInfoTitle}>🧭 NAVIGATION ACTIVE</Text>
                  </View>
                  <View style={styles.navInfoDetails}>
                    <Text style={styles.navInfoRoute}>{routeName}</Text>
                    <Text style={styles.navInfoMeta}>
                      {distance ? `${distance} km` : ''} • {duration ? `${duration} min` : ''}
                    </Text>
                  </View>
                </View>
              )}
              {roads.filter(r => r.id === selectedRoadId).map(road => (
                <View key={road.id} style={styles.roadInfo}>
                  <View style={styles.roadInfoHeader}>
                    <View style={[styles.roadStatusDot, { backgroundColor: getStatusColor(road.status) }]} />
                    <Text style={styles.roadName}>{road.name}</Text>
                    <Text style={[styles.roadStatus, { color: getStatusColor(road.status) }]}>{STATUS_EMOJI[road.status]} {road.status}</Text>
                  </View>
                  <View style={styles.roadStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{road.vehicleCount}</Text>
                      <Text style={styles.statLabel}>Vehicles</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{road.density}%</Text>
                      <Text style={styles.statLabel}>Density</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{Math.max(5, Math.round(50 * (1 - road.density / 100)))} km/h</Text>
                      <Text style={styles.statLabel}>Avg Speed</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        // Standard Scrollable Layout with Map Card
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Map Card */}
          <View style={styles.mapCard}>
            <View style={styles.mapCardHeader}>
              <Text style={styles.mapCardTitle}>📍 CITY TRAFFIC NETWORK</Text>
              <Pressable onPress={() => setIsFullScreen(true)} style={styles.fullScreenToggleBtn}>
                <MaterialIcons name="fullscreen" size={18} color={Colors.primary} />
                <Text style={styles.fullScreenToggleText}>FULLSCREEN</Text>
              </Pressable>
            </View>

            <View style={styles.mapContainer}>
              {renderMapView()}

              {/* Map Floating Controls */}
              <View style={styles.mapControlsFloating}>
                <Pressable onPress={cycleTileLayer} style={styles.controlBtn}>
                  <Text style={styles.controlBtnText}>🗺️ {tileLayer.toUpperCase()}</Text>
                </Pressable>
                <Pressable onPress={fitAllMarkers} style={styles.controlBtn}>
                  <Text style={styles.controlBtnText}>⌖ Fit All</Text>
                </Pressable>
                <Pressable onPress={() => setShowSignals(!showSignals)} style={[styles.controlBtn, !showSignals && styles.controlBtnOff]}>
                  <Text style={styles.controlBtnText}>🚦 Signals</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Selected Road Card */}
          {selectedRoadId && (
            <View style={styles.selectedRoadCardInline}>
              <Pressable onPress={() => setSelectedRoadId(null)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color={Colors.textMuted} />
              </Pressable>
              {roads.filter(r => r.id === selectedRoadId).map(road => (
                <View key={road.id} style={styles.roadInfo}>
                  <View style={styles.roadInfoHeader}>
                    <View style={[styles.roadStatusDot, { backgroundColor: getStatusColor(road.status) }]} />
                    <Text style={styles.roadName}>{road.name}</Text>
                    <Text style={[styles.roadStatus, { color: getStatusColor(road.status) }]}>{STATUS_EMOJI[road.status]} {road.status}</Text>
                  </View>
                  <View style={styles.roadStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{road.vehicleCount}</Text>
                      <Text style={styles.statLabel}>Vehicles</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{road.density}%</Text>
                      <Text style={styles.statLabel}>Density</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{Math.max(5, Math.round(50 * (1 - road.density / 100)))} km/h</Text>
                      <Text style={styles.statLabel}>Avg Speed</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Summary Row */}
          <View style={styles.summaryRow}>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TrafficStatus[]).map(s => (
              <View key={s} style={[styles.summaryCard, { borderColor: `${getStatusColor(s)}44` }]}>
                <Text style={[styles.summaryCount, { color: getStatusColor(s) }]}>{grouped[s].length}</Text>
                <Text style={styles.summaryLabel}>{STATUS_EMOJI[s]}</Text>
                <Text style={styles.summaryStatus}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Layer Toggles */}
          <View style={styles.layerToggles}>
            <Pressable onPress={() => setShowSignals(!showSignals)} style={[styles.layerToggle, showSignals && styles.layerToggleOn]}>
              <Text style={[styles.layerToggleText, showSignals && styles.layerToggleTextOn]}>🚦 Signals ({signals.length})</Text>
            </Pressable>
            <Pressable onPress={() => setShowIncidents(!showIncidents)} style={[styles.layerToggle, showIncidents && styles.layerToggleOn]}>
              <Text style={[styles.layerToggleText, showIncidents && styles.layerToggleTextOn]}>🚨 Incidents ({activeIncidents.length})</Text>
            </Pressable>
            <Pressable onPress={() => setShowHospitals(!showHospitals)} style={[styles.layerToggle, showHospitals && styles.layerToggleOn]}>
              <Text style={[styles.layerToggleText, showHospitals && styles.layerToggleTextOn]}>🏥 Hospitals</Text>
            </Pressable>
          </View>

          {/* Road List */}
          <SectionHeader title="Monitored Roads" subtitle={`${roads.length} corridors with live telemetry`} />
          {roads.map(road => (
            <Pressable key={road.id} onPress={() => setSelectedRoadId(road.id)}>
              <RoadStatusCard road={road} />
            </Pressable>
          ))}

          <View style={styles.bottom} />
        </ScrollView>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, position: 'relative' },
  mapFullScreen: { flex: 1, width: '100%', height: '100%' },
  scroll: { padding: Spacing.base, gap: Spacing.md },
  mapCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  mapCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapCardTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  fullScreenToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  fullScreenToggleText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  mapContainer: {
    height: 320,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0a0c10',
  },
  mapInline: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs,
    zIndex: 10,
  },
  mapControlsFloating: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.xs,
    zIndex: 10,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17,24,39,0.92)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  controlBtnOff: { opacity: 0.5 },
  controlBtnText: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.5 },

  selectedRoadCard: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 10,
  },
  selectedRoadCardInline: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  navInfoBanner: {
    backgroundColor: Colors.primaryDim,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  navInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  navInfoTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  navInfoDetails: { gap: 2 },
  navInfoRoute: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  navInfoMeta: { fontSize: FontSize.xs, color: Colors.textSecondary },
  roadInfo: { gap: Spacing.xs },
  roadInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  roadStatusDot: { width: 10, height: 10, borderRadius: 5 },
  roadName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  roadStatus: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.5 },
  roadStats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    gap: 2,
  },
  summaryCount: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: 16 },
  summaryStatus: { fontSize: 9, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },

  layerToggles: { flexDirection: 'row', gap: Spacing.sm },
  layerToggle: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  layerToggleOn: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}12` },
  layerToggleText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  layerToggleTextOn: { color: Colors.primary, fontWeight: '700' },

  incidentMarker: {
    alignItems: 'center',
  },
  markerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerEmoji: { fontSize: 14 },
  markerLabel: {
    backgroundColor: 'rgba(10,12,16,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
  },
  markerLabelText: { fontSize: 9, color: '#fff', fontWeight: 'bold' },
  markerSeverity: { fontSize: 8, color: Colors.red, fontWeight: 'bold' },

  ambulanceWrapper: { alignItems: 'center', justifyContent: 'center' },
  ambulancePulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.emergency,
  },
  ambulanceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  ambulanceEmoji: { fontSize: 14 },
  ambulanceCallout: {
    backgroundColor: 'rgba(10,12,16,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
  },
  calloutVehicleId: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  calloutSpeed: { fontSize: 8, color: Colors.green },
  calloutEta: { fontSize: 8, color: Colors.yellow },

  hospitalMarker: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hospitalEmoji: { fontSize: 14 },
  hospitalName: { fontSize: 10, color: Colors.textPrimary, fontWeight: 'bold' },

  signalMarker: { alignItems: 'center' },
  signalDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#fff' },
  corridorBadge: { position: 'absolute', top: -10, fontSize: 10 },
  signalName: { fontSize: 8, color: Colors.textPrimary, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 3, borderRadius: 2, marginTop: 1 },

  bottom: { height: 40 },
});