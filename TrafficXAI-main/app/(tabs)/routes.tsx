// TRAFFICX AI — Route Optimizer & Live Route Map
import React, { useState, useMemo, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Modal, TextInput } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { RouteCard } from '@/components/feature/RouteCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';

const MAP_TILES = {
  dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  voyager: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
};

const ORIGIN_PRESETS = [
  { name: 'Junction 4 – Ganapathy', lat: 10.9951, lng: 77.0069 },
  { name: 'Signal 7 – Avinashi Road', lat: 11.0136, lng: 77.0247 },
  { name: 'Junction 2 – RS Puram', lat: 11.0005, lng: 76.9691 },
  { name: 'Junction 3 – Peelamedu', lat: 11.0104, lng: 77.0432 },
  { name: 'Junction 5 – Singanallur', lat: 10.9752, lng: 77.0330 },
  { name: 'Junction 1 – Anna Nagar', lat: 11.0168, lng: 77.0061 },
];

const DESTINATION_PRESETS = [
  { name: 'Government Hospital', lat: 11.0100, lng: 77.0155 },
  { name: 'KMCH Medical Center', lat: 11.0138, lng: 77.0330 },
  { name: 'PSG Hospitals', lat: 11.0250, lng: 77.0020 },
  { name: 'Coimbatore Medical College', lat: 11.0220, lng: 77.0280 },
  { name: 'Airport Emergency Center', lat: 11.0300, lng: 77.0430 },
];

export default function Routes() {
  const router = useRouter();
  const { routes, signals } = useTraffic();
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(ORIGIN_PRESETS[0].name);
  const [hospitalDestination, setHospitalDestination] = useState(DESTINATION_PRESETS[0].name);

  // Edit Modals
  const [editModalType, setEditModalType] = useState<'origin' | 'dest' | null>(null);
  const [customInputText, setCustomInputText] = useState('');

  // Map settings
  const [tileLayer, setTileLayer] = useState<'dark' | 'osm' | 'voyager'>('dark');
  const mapRef = useRef<any>(null);

  // Notification Banner
  const [notification, setNotification] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'info' | 'dispatch' }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const originCoords = useMemo(() => {
    const preset = ORIGIN_PRESETS.find(p => p.name === ambulanceLocation);
    return preset ? { latitude: preset.lat, longitude: preset.lng } : { latitude: 10.9951, longitude: 77.0069 };
  }, [ambulanceLocation]);

  const destCoords = useMemo(() => {
    const preset = DESTINATION_PRESETS.find(p => p.name === hospitalDestination);
    return preset ? { latitude: preset.lat, longitude: preset.lng } : { latitude: 11.0100, longitude: 77.0155 };
  }, [hospitalDestination]);

  const corridorSignals = signals.filter(s => s.greenCorridor);

  const calculateRouteCost = (route: any) => {
    const distanceScore = route.distance * 10;
    const trafficScores: Record<string, number> = { LOW: 10, MEDIUM: 30, HIGH: 60, CRITICAL: 90 };
    const trafficScore = trafficScores[route.trafficStatus] || 50;
    const incidentScore = route.blocked ? 50 : 0;
    return Math.round(distanceScore * 0.4 + trafficScore * 0.4 + incidentScore * 0.2);
  };

  const routesWithCost = useMemo(() => {
    return routes.map(r => ({
      ...r,
      calculatedCost: calculateRouteCost(r),
    }));
  }, [routes]);

  const activeRoute = selectedRoute || routesWithCost.find(r => r.recommended) || routesWithCost[0];

  // Generate dynamic coordinates along route for map polyline
  const routePolylineCoords = useMemo(() => {
    return [
      originCoords,
      { latitude: (originCoords.latitude + destCoords.latitude) / 2 + 0.003, longitude: (originCoords.longitude + destCoords.longitude) / 2 - 0.004 },
      ...corridorSignals.map(s => ({ latitude: s.lat, longitude: s.lng })),
      destCoords,
    ];
  }, [originCoords, destCoords, corridorSignals]);

  const handleCalculateRoute = () => {
    const bestRoute = routesWithCost.find(r => r.recommended) || routesWithCost[0];
    setSelectedRoute(bestRoute);
    setNotification({
      visible: true,
      title: '🎯 OPTIMAL ROUTE CALCULATED',
      message: `${bestRoute.name} selected. Lowest congestion (Cost Score: ${bestRoute.calculatedCost}). Estimated savings: ~10 minutes.`,
      type: 'success',
    });
  };

  const handleDispatchCorridor = () => {
    const routeToNavigate = activeRoute;
    router.push({
      pathname: '/(tabs)/live-traffic',
      params: {
        routeId: routeToNavigate.id,
        routeName: routeToNavigate.name,
        waypoints: JSON.stringify(routeToNavigate.waypoints),
        distance: routeToNavigate.distance,
        duration: routeToNavigate.duration,
      }
    });
    
    setNotification({
      visible: true,
      title: '🚨 GREEN CORRIDOR ACTIVATED',
      message: `Route ${routeToNavigate.name} sent to live map. Junctions synchronized to GREEN for ambulance passage.`,
      type: 'dispatch',
    });
  };

  const handleSelectOrigin = (name: string) => {
    setAmbulanceLocation(name);
    setEditModalType(null);
  };

  const handleSelectDestination = (name: string) => {
    setHospitalDestination(name);
    setEditModalType(null);
  };

  const handleSaveCustomLocation = () => {
    if (!customInputText.trim()) return;
    if (editModalType === 'origin') {
      setAmbulanceLocation(customInputText.trim());
    } else if (editModalType === 'dest') {
      setHospitalDestination(customInputText.trim());
    }
    setEditModalType(null);
    setCustomInputText('');
  };

  return (
    <ScreenShell title="ROUTE OPTIMIZER">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Real-time Notification Banner */}
        {notification.visible && (
          <View style={[
            styles.notificationBanner,
            notification.type === 'dispatch' ? styles.notificationDispatch : styles.notificationSuccess
          ]}>
            <View style={styles.notificationIcon}>
              <MaterialIcons
                name={notification.type === 'dispatch' ? 'emergency-share' : 'check-circle'}
                size={22}
                color={notification.type === 'dispatch' ? Colors.emergency : Colors.green}
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationText}>{notification.message}</Text>
            </View>
            <Pressable onPress={() => setNotification({ ...notification, visible: false })} style={styles.notificationClose}>
              <MaterialIcons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        )}

        {/* Route Configuration Card */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>🗺️ ROUTE CONFIGURATION & DISPATCH</Text>
          
          <View style={styles.configRow}>
            {/* Origin Field */}
            <View style={styles.configField}>
              <Text style={styles.configLabel}>Ambulance Location</Text>
              <Pressable
                onPress={() => {
                  setCustomInputText(ambulanceLocation);
                  setEditModalType('origin');
                }}
                style={styles.configValue}
              >
                <Text style={styles.configValueText} numberOfLines={1}>{ambulanceLocation}</Text>
                <MaterialIcons name="edit" size={16} color={Colors.primary} />
              </Pressable>
            </View>

            <MaterialIcons name="arrow-forward" size={20} color={Colors.primary} style={styles.arrowIcon} />

            {/* Destination Field */}
            <View style={styles.configField}>
              <Text style={styles.configLabel}>Destination</Text>
              <Pressable
                onPress={() => {
                  setCustomInputText(hospitalDestination);
                  setEditModalType('dest');
                }}
                style={styles.configValue}
              >
                <Text style={styles.configValueText} numberOfLines={1}>{hospitalDestination}</Text>
                <MaterialIcons name="edit" size={16} color={Colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable onPress={handleCalculateRoute} style={styles.calculateBtn}>
              <MaterialIcons name="alt-route" size={18} color="#fff" />
              <Text style={styles.calculateBtnText}>CALCULATE OPTIMAL ROUTE</Text>
            </Pressable>

            <Pressable onPress={handleDispatchCorridor} style={styles.dispatchBtn}>
              <MaterialIcons name="notifications-active" size={18} color="#fff" />
              <Text style={styles.dispatchBtnText}>DISPATCH SIGNALS</Text>
            </Pressable>
          </View>
        </View>

        {/* Free Live Route Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>🗺️ LIVE ROUTE MAP (OPENSTREETMAP / DARK AI)</Text>
            <Pressable
              onPress={() => setTileLayer(tileLayer === 'dark' ? 'osm' : tileLayer === 'osm' ? 'voyager' : 'dark')}
              style={styles.tileSwitchBtn}
            >
              <Text style={styles.tileSwitchText}>🎨 {tileLayer.toUpperCase()}</Text>
            </Pressable>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: (originCoords.latitude + destCoords.latitude) / 2,
                longitude: (originCoords.longitude + destCoords.longitude) / 2,
                latitudeDelta: 0.045,
                longitudeDelta: 0.045,
              }}
              showsUserLocation={false}
              zoomEnabled={true}
              scrollEnabled={true}
              mapType="none"
              provider={PROVIDER_DEFAULT}
            >
              {/* Free Open Map Tiles */}
              <UrlTile
                urlTemplate={MAP_TILES[tileLayer]}
                maximumZ={19}
                flipY={false}
                zIndex={-1}
              />

              {/* Optimal Route Polyline */}
              <Polyline
                coordinates={routePolylineCoords}
                strokeColor={Colors.primary}
                strokeWidth={5}
                lineDashPattern={activeRoute?.blocked ? [6, 4] : undefined}
              />

              {/* Origin Marker */}
              <Marker coordinate={originCoords} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.mapMarkerOrigin}>
                  <Text style={styles.markerEmoji}>🚑</Text>
                </View>
              </Marker>

              {/* Destination Marker */}
              <Marker coordinate={destCoords} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.mapMarkerDest}>
                  <Text style={styles.markerEmoji}>🏥</Text>
                </View>
              </Marker>

              {/* Signal Waypoints */}
              {corridorSignals.map((signal, idx) => (
                <Marker key={signal.id} coordinate={{ latitude: signal.lat, longitude: signal.lng }} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={styles.mapMarkerSignal}>
                    <Text style={styles.signalMarkerEmoji}>🚦</Text>
                    <View style={styles.signalIdxBadge}>
                      <Text style={styles.signalIdxText}>{idx + 1}</Text>
                    </View>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>
        </View>

        {/* Algorithm Info */}
        <View style={styles.algoCard}>
          <Text style={styles.algoTitle}>🧠 AI ROUTE COST ALGORITHM</Text>
          <View style={styles.formulaRow}>
            <View style={styles.formulaItem}>
              <Text style={[styles.formulaValue, { color: Colors.primary }]}>0.4</Text>
              <Text style={styles.formulaLabel}>Distance</Text>
            </View>
            <Text style={styles.formulaPlus}>+</Text>
            <View style={styles.formulaItem}>
              <Text style={[styles.formulaValue, { color: Colors.yellow }]}>0.4</Text>
              <Text style={styles.formulaLabel}>Traffic</Text>
            </View>
            <Text style={styles.formulaPlus}>+</Text>
            <View style={styles.formulaItem}>
              <Text style={[styles.formulaValue, { color: Colors.red }]}>0.2</Text>
              <Text style={styles.formulaLabel}>Incident Risk</Text>
            </View>
            <Text style={styles.formulaEquals}>=</Text>
            <View style={styles.formulaItem}>
              <Text style={[styles.formulaValue, { color: Colors.green }]}>Cost</Text>
              <Text style={styles.formulaLabel}>Score</Text>
            </View>
          </View>
          <Text style={styles.algoNote}>Lower score = faster, safest passage for emergency vehicles</Text>
        </View>

        {/* Selected Route Detail */}
        {activeRoute && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.detailHeaderLeft}>
                <Text style={styles.detailTitle}>{activeRoute.name}</Text>
                {activeRoute.recommended && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>RECOMMENDED</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.detailGrid}>
              <DetailItem label="Distance" value={`${activeRoute.distance} km`} color={Colors.primary} />
              <DetailItem label="Duration" value={`${activeRoute.duration} min`} color={Colors.yellow} />
              <DetailItem label="Traffic" value={activeRoute.trafficStatus} color={getTrafficColor(activeRoute.trafficStatus)} />
              <DetailItem label="Cost Score" value={`${activeRoute.calculatedCost}`} color={activeRoute.recommended ? Colors.green : Colors.textPrimary} />
              <DetailItem label="Waypoints" value={`${activeRoute.waypoints.length}`} color={Colors.blue} />
              <DetailItem label="Status" value={activeRoute.blocked ? 'BLOCKED' : 'CLEAR'} color={activeRoute.blocked ? Colors.red : Colors.green} />
            </View>

            <View style={styles.actionButtons}>
              <Pressable onPress={handleDispatchCorridor} style={styles.navigateBtn}>
                <MaterialIcons name="navigation" size={20} color="#fff" />
                <Text style={styles.navigateBtnText}>START GREEN CORRIDOR</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* All Routes Comparison */}
        <SectionHeader title="Route Comparison" subtitle={`${routesWithCost.length} routes evaluated`} />
        
        <View style={styles.comparisonTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Route</Text>
            <Text style={styles.tableCell}>Distance</Text>
            <Text style={styles.tableCell}>Duration</Text>
            <Text style={styles.tableCell}>Traffic</Text>
            <Text style={styles.tableCell}>Cost</Text>
            <Text style={styles.tableCell}>Status</Text>
          </View>
          {routesWithCost.map(r => (
            <Pressable
              key={r.id}
              onPress={() => setSelectedRoute(r)}
              style={[
                styles.tableRow,
                r.id === activeRoute?.id && styles.tableRowSelected,
                r.recommended && styles.tableRowRecommended,
              ]}
            >
              <View style={styles.tableCellRoute}>
                <View style={[styles.routeColorDot, { backgroundColor: getTrafficColor(r.trafficStatus) }]} />
                <Text style={[styles.tableRouteName, r.recommended && styles.tableRouteNameBest]}>{r.name}</Text>
              </View>
              <Text style={styles.tableCell}>{r.distance} km</Text>
              <Text style={styles.tableCell}>{r.duration} min</Text>
              <View style={styles.tableCellTraffic}>
                <View style={[styles.trafficDot, { backgroundColor: getTrafficColor(r.trafficStatus) }]} />
                <Text style={styles.tableCell}>{r.trafficStatus}</Text>
              </View>
              <Text style={[styles.tableCellCost, { color: r.recommended ? Colors.green : Colors.textPrimary }]}>
                {r.calculatedCost}
                {r.recommended && <Text style={styles.bestIndicator}> ⭐</Text>}
              </Text>
              <Text style={[styles.tableCellStatus, { color: r.blocked ? Colors.red : Colors.green }]}>
                {r.blocked ? '⛔ Blocked' : '✅ Clear'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Green Corridor Signals */}
        {corridorSignals.length > 0 && (
          <View style={styles.corridorSection}>
            <Text style={styles.corridorTitle}>🚦 SYNCHRONIZED GREEN CORRIDOR SIGNALS</Text>
            <View style={styles.corridorList}>
              {corridorSignals.map((s, i) => (
                <View key={s.id} style={styles.corridorItem}>
                  <View style={styles.corridorStepNum}>
                    <Text style={styles.corridorStepNumText}>{i + 1}</Text>
                  </View>
                  <View style={styles.corridorInfo}>
                    <Text style={styles.corridorName}>{s.junctionName.split('–')[1]?.trim() || s.junctionName}</Text>
                    <Text style={styles.corridorState}>Signal: {s.state} • Vehicles: {s.vehicleCount}</Text>
                  </View>
                  <View style={[styles.corridorStateBadge, { backgroundColor: s.state === 'GREEN' ? Colors.greenBg : s.state === 'YELLOW' ? Colors.yellowBg : Colors.redBg }]}>
                    <Text style={[styles.corridorStateText, { color: s.state === 'GREEN' ? Colors.green : s.state === 'YELLOW' ? Colors.yellow : Colors.red }]}>
                      {s.state}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottom} />
      </ScrollView>

      {/* Origin / Destination Edit Modal */}
      <Modal visible={editModalType !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editModalType === 'origin' ? '🚑 Select Ambulance Location' : '🏥 Select Hospital Destination'}
              </Text>
              <Pressable onPress={() => setEditModalType(null)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>

            {/* Custom Input */}
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Or type custom location name..."
                placeholderTextColor={Colors.textMuted}
                value={customInputText}
                onChangeText={setCustomInputText}
              />
              <Pressable onPress={handleSaveCustomLocation} style={styles.customSaveBtn}>
                <Text style={styles.customSaveBtnText}>Set</Text>
              </Pressable>
            </View>

            {/* Preset Options */}
            <Text style={styles.presetHeading}>QUICK PRESETS</Text>
            <ScrollView style={styles.presetList}>
              {(editModalType === 'origin' ? ORIGIN_PRESETS : DESTINATION_PRESETS).map(item => (
                <Pressable
                  key={item.name}
                  onPress={() => editModalType === 'origin' ? handleSelectOrigin(item.name) : handleSelectDestination(item.name)}
                  style={styles.presetItem}
                >
                  <MaterialIcons
                    name={editModalType === 'origin' ? 'local-shipping' : 'local-hospital'}
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.presetItemText}>{item.name}</Text>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

function DetailItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailItemLabel}>{label}</Text>
      <Text style={[styles.detailItemValue, { color }]}>{value}</Text>
    </View>
  );
}

function getTrafficColor(status: string): string {
  switch (status) {
    case 'LOW': return Colors.green;
    case 'MEDIUM': return Colors.yellow;
    case 'HIGH': return Colors.orange;
    case 'CRITICAL': return Colors.red;
    default: return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  notificationSuccess: {
    backgroundColor: '#064e3b',
    borderColor: Colors.green,
  },
  notificationDispatch: {
    backgroundColor: '#450a0a',
    borderColor: Colors.emergency,
  },
  notificationIcon: { justifyContent: 'center', alignItems: 'center' },
  notificationContent: { flex: 1, gap: 2 },
  notificationTitle: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  notificationText: { fontSize: FontSize.xs, color: '#f0f4ff', lineHeight: 16 },
  notificationClose: { padding: 4 },

  configCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  configTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  configField: { flex: 1, gap: Spacing.xs },
  configLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  configValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  configValueText: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.semibold, flex: 1 },
  arrowIcon: { marginHorizontal: 2 },
  buttonRow: { flexDirection: 'row', gap: Spacing.sm },
  calculateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  calculateBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.5 },
  dispatchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emergency,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  dispatchBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.5 },

  mapCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  tileSwitchBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileSwitchText: { fontSize: 10, fontWeight: '700', color: Colors.textPrimary },
  mapContainer: {
    height: 220,
    borderRadius: Radius.md,
    overflow: 'hidden',
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
  mapMarkerOrigin: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapMarkerDest: {
    backgroundColor: Colors.red,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mapMarkerSignal: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  markerEmoji: { fontSize: 16 },
  signalMarkerEmoji: { fontSize: 13 },
  signalIdxBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.green,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalIdxText: { fontSize: 8, fontWeight: 'bold', color: '#000' },

  algoCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  algoTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  formulaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  formulaItem: { alignItems: 'center' },
  formulaValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  formulaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  formulaPlus: { fontSize: FontSize.lg, color: Colors.textMuted, fontWeight: 'bold' },
  formulaEquals: { fontSize: FontSize.lg, color: Colors.textMuted, fontWeight: 'bold' },
  algoNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },

  detailCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.md,
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  bestBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  bestBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  detailItem: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailItemLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  detailItemValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginTop: 2 },

  actionButtons: { marginTop: Spacing.xs },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  navigateBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.5 },

  comparisonTable: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowSelected: { backgroundColor: `${Colors.primary}12` },
  tableRowRecommended: { borderColor: `${Colors.green}33` },
  tableCell: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },
  tableCellRoute: { flex: 1.5, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  routeColorDot: { width: 8, height: 8, borderRadius: 4 },
  tableRouteName: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  tableRouteNameBest: { color: Colors.green, fontWeight: FontWeight.bold },
  tableCellTraffic: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  trafficDot: { width: 6, height: 6, borderRadius: 3 },
  tableCellCost: { flex: 0.8, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  bestIndicator: { fontSize: 10 },
  tableCellStatus: { flex: 1, fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  corridorSection: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  corridorTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  corridorList: { gap: Spacing.sm },
  corridorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
  },
  corridorStepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corridorStepNumText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  corridorInfo: { flex: 1 },
  corridorName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  corridorState: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  corridorStateBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  corridorStateText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalCloseBtn: { padding: 4 },
  customInputRow: { flexDirection: 'row', gap: Spacing.sm },
  customInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: FontSize.sm,
  },
  customSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customSaveBtnText: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  presetHeading: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  presetList: { maxHeight: 240 },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  presetItemText: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  bottom: { height: 40 },
});