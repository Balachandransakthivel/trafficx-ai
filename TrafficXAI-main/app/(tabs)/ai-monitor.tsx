// TRAFFICX AI — AI Vehicle Detection & Live Vision Monitor
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const CAMERAS = [
  { id: 'CAM-01', name: 'Avinashi Road – Signal 7', lat: 11.0136, lng: 77.0247, fps: 30, resolution: '1080p' },
  { id: 'CAM-02', name: 'NH Road – Junction 4', lat: 10.9990, lng: 77.0251, fps: 30, resolution: '1080p' },
  { id: 'CAM-03', name: 'DB Road – Bypass', lat: 11.0005, lng: 76.9691, fps: 28, resolution: '1080p' },
  { id: 'CAM-04', name: 'Trichy Road – Peelamedu', lat: 10.9852, lng: 77.0200, fps: 30, resolution: '4K' },
  { id: 'CAM-05', name: 'Mettupalayam Road', lat: 11.0087, lng: 76.9876, fps: 25, resolution: '1080p' },
];

const DETECTION_CLASSES = [
  { label: 'Car', emoji: '🚗', color: Colors.blue },
  { label: 'Bike', emoji: '🏍️', color: Colors.yellow },
  { label: 'Bus', emoji: '🚌', color: Colors.orange },
  { label: 'Truck', emoji: '🚚', color: Colors.red },
  { label: 'Ambulance', emoji: '🚑', color: Colors.emergency },
];

const DETECTED_VEHICLES_STREAM = [
  { id: 'V-101', type: 'Car', emoji: '🚗', model: 'Sedan (White)', plate: 'TN 38 BG 4092', speed: '48 km/h', conf: 96, lane: 'Lane 1' },
  { id: 'V-102', type: 'Ambulance', emoji: '🚑', model: 'Emergency Unit AMB-001', plate: 'TN 38 EM 108', speed: '64 km/h', conf: 99, lane: 'Lane 2 (Priority)' },
  { id: 'V-103', type: 'Bus', emoji: '🚌', model: 'Transit City Bus #14', plate: 'TN 38 N 2190', speed: '32 km/h', conf: 94, lane: 'Lane 3' },
  { id: 'V-104', type: 'Truck', emoji: '🚚', model: 'Container Hauler', plate: 'TN 38 CT 8841', speed: '28 km/h', conf: 91, lane: 'Lane 1' },
  { id: 'V-105', type: 'Bike', emoji: '🏍️', model: 'Motorcycle (150cc)', plate: 'TN 38 F 7720', speed: '42 km/h', conf: 97, lane: 'Lane 2' },
];

function DetectionFeed({ detection, camera }: { detection: any; camera: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const carMoveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(carMoveAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(carMoveAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={feedStyles.container}>
      {/* CCTV Traffic Scene Background */}
      <View style={feedStyles.cctvScene}>
        {/* Road Surface */}
        <View style={feedStyles.roadAsphalt}>
          {/* Lane Dividers */}
          <View style={feedStyles.laneDividerLeft} />
          <View style={feedStyles.laneDividerCenter} />
          <View style={feedStyles.laneDividerRight} />

          {/* Vehicle 1: Car */}
          <Animated.View style={[
            feedStyles.vehicleCar,
            {
              transform: [{
                translateY: carMoveAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 160] }),
              }]
            }
          ]}>
            <View style={feedStyles.vehicleBoundingBoxCar}>
              <Text style={feedStyles.vehicleTagCar}>CAR 96%</Text>
              <Text style={feedStyles.vehicleEmojiDisplay}>🚗</Text>
              <Text style={feedStyles.vehicleSpeedTag}>48 km/h</Text>
            </View>
          </Animated.View>

          {/* Vehicle 2: Ambulance */}
          <Animated.View style={[
            feedStyles.vehicleAmbulance,
            {
              transform: [{
                translateY: carMoveAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 180] }),
              }]
            }
          ]}>
            <View style={feedStyles.vehicleBoundingBoxAmb}>
              <Text style={feedStyles.vehicleTagAmb}>AMBULANCE 99%</Text>
              <Text style={feedStyles.vehicleEmojiDisplay}>🚑</Text>
              <Text style={feedStyles.vehicleSpeedTagAmb}>PRIORITY 64km/h</Text>
            </View>
          </Animated.View>

          {/* Vehicle 3: Bus */}
          <View style={feedStyles.vehicleBus}>
            <View style={feedStyles.vehicleBoundingBoxBus}>
              <Text style={feedStyles.vehicleTagBus}>BUS 94%</Text>
              <Text style={feedStyles.vehicleEmojiDisplay}>🚌</Text>
            </View>
          </View>

          {/* Vehicle 4: Truck */}
          <View style={feedStyles.vehicleTruck}>
            <View style={feedStyles.vehicleBoundingBoxTruck}>
              <Text style={feedStyles.vehicleTagTruck}>TRUCK 91%</Text>
              <Text style={feedStyles.vehicleEmojiDisplay}>🚚</Text>
            </View>
          </View>

          {/* Vehicle 5: Bike */}
          <View style={feedStyles.vehicleBike}>
            <View style={feedStyles.vehicleBoundingBoxBike}>
              <Text style={feedStyles.vehicleTagBike}>BIKE 97%</Text>
              <Text style={feedStyles.vehicleEmojiDisplay}>🏍️</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Real-time Green Scan Line */}
      <Animated.View style={[
        feedStyles.scanLine,
        {
          transform: [{
            translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] })
          }]
        }
      ]} />

      {/* Top Header Overlay */}
      <View style={feedStyles.topBar}>
        <View style={feedStyles.recChip}>
          <Animated.View style={[feedStyles.recDot, { opacity: pulseAnim }]} />
          <Text style={feedStyles.recText}>LIVE CCTV • {camera.id}</Text>
        </View>
        <View style={feedStyles.aiEngineBadge}>
          <Text style={feedStyles.aiEngineText}>⚡ YOLOv8n VISION (30 FPS)</Text>
        </View>
      </View>

      {/* Bottom Telemetry Overlay */}
      <View style={feedStyles.bottomBar}>
        <Text style={feedStyles.camLocationText}>{camera.name}</Text>
        <Text style={feedStyles.densityBadge}>DENSITY: {detection.density}%</Text>
      </View>
    </View>
  );
}

export default function AIMonitor() {
  const { detection } = useTraffic();
  const [selectedCamera, setSelectedCamera] = useState(CAMERAS[0]);
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<any[]>([]);

  const statusColor = getStatusColor(detection.trafficStatus);

  const vehicleTypes = [
    { key: 'cars', label: 'Cars', emoji: '🚗', value: detection.cars, color: Colors.blue },
    { key: 'bikes', label: 'Bikes', emoji: '🏍️', value: detection.bikes, color: Colors.yellow },
    { key: 'buses', label: 'Buses', emoji: '🚌', value: detection.buses, color: Colors.orange },
    { key: 'trucks', label: 'Trucks', emoji: '🚚', value: detection.trucks, color: Colors.red },
    { key: 'ambulances', label: 'Emergency', emoji: '🚑', value: detection.ambulances, color: Colors.emergency },
  ];

  return (
    <ScreenShell title="AI VISION MONITOR">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* CCTV Camera Stream */}
        <DetectionFeed detection={detection} camera={selectedCamera} />

        {/* Camera Selector Bar */}
        <View style={styles.cameraSelector}>
          <Pressable
            style={styles.selectedCameraRow}
            onPress={() => setShowCameraSelector(!showCameraSelector)}
          >
            <View style={styles.cameraInfoLeft}>
              <MaterialIcons name="videocam" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.cameraNameText}>{selectedCamera.name}</Text>
                <Text style={styles.cameraMetaText}>{selectedCamera.id} • {selectedCamera.fps} FPS • {selectedCamera.resolution}</Text>
              </View>
            </View>
            <MaterialIcons
              name={showCameraSelector ? 'expand-less' : 'expand-more'}
              size={24}
              color={Colors.textSecondary}
            />
          </Pressable>

          {showCameraSelector && (
            <View style={styles.cameraDropdown}>
              {CAMERAS.map((cam) => (
                <Pressable
                  key={cam.id}
                  style={[
                    styles.cameraDropdownItem,
                    cam.id === selectedCamera.id && styles.cameraDropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCamera(cam);
                    setShowCameraSelector(false);
                  }}
                >
                  <MaterialIcons
                    name="videocam"
                    size={18}
                    color={cam.id === selectedCamera.id ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[
                    styles.cameraDropdownText,
                    cam.id === selectedCamera.id && styles.cameraDropdownTextSelected
                  ]}>
                    {cam.name} ({cam.id})
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Live Detected Vehicles Stream */}
        <View style={styles.streamCard}>
          <View style={styles.streamHeader}>
            <Text style={styles.streamTitle}>🚘 LIVE DETECTED VEHICLES (YOLOv8 STREAM)</Text>
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>TRACKING 5 VEHICLES</Text>
            </View>
          </View>

          <View style={styles.streamList}>
            {DETECTED_VEHICLES_STREAM.map(veh => (
              <View key={veh.id} style={styles.streamItem}>
                <View style={styles.streamEmojiWrap}>
                  <Text style={styles.streamEmoji}>{veh.emoji}</Text>
                </View>
                <View style={styles.streamInfo}>
                  <View style={styles.streamRow}>
                    <Text style={styles.streamModel}>{veh.model}</Text>
                    <Text style={styles.streamPlate}>{veh.plate}</Text>
                  </View>
                  <Text style={styles.streamMeta}>{veh.lane} • Speed: {veh.speed}</Text>
                </View>
                <View style={styles.streamConfBadge}>
                  <Text style={styles.streamConfText}>{veh.conf}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Total Vehicle Counts */}
        <View style={[styles.totalCard, { borderColor: `${statusColor}44`, backgroundColor: `${statusColor}10` }]}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalLabel}>TOTAL VEHICLES DETECTED</Text>
            <Text style={[styles.totalValue, { color: statusColor }]}>{detection.totalVehicles}</Text>
          </View>
          <View style={styles.totalRight}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {detection.trafficStatus === 'LOW' ? '🟢' : detection.trafficStatus === 'MEDIUM' ? '🟡' : detection.trafficStatus === 'HIGH' ? '🟠' : '🔴'} {detection.trafficStatus}
            </Text>
            <Text style={styles.densityLabel}>Density: {detection.density}%</Text>
          </View>
        </View>

        {/* Vehicle Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>VEHICLE CLASSIFICATION BREAKDOWN</Text>
          {vehicleTypes.map(v => (
            <View key={v.key} style={styles.vehicleRow}>
              <Text style={styles.vehicleEmoji}>{v.emoji}</Text>
              <Text style={styles.vehicleLabel}>{v.label}</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.barFill, {
                  width: `${detection.totalVehicles > 0 ? Math.round((v.value / detection.totalVehicles) * 100) : 0}%` as any,
                  backgroundColor: v.color
                }]} />
              </View>
              <Text style={[styles.vehicleCount, { color: v.color }]}>{v.value}</Text>
            </View>
          ))}
        </View>

        {/* Class Confidence */}
        <View style={styles.classCard}>
          <Text style={styles.classTitle}>🎯 MODEL CLASS CONFIDENCE</Text>
          <View style={styles.classGrid}>
            {DETECTION_CLASSES.map(cls => (
              <View key={cls.label} style={styles.classItem}>
                <Text style={styles.classEmoji}>{cls.emoji}</Text>
                <Text style={styles.classLabel}>{cls.label}</Text>
                <View style={styles.classConf}>
                  <View style={styles.classConfBar}>
                    <View style={[styles.classConfFill, { backgroundColor: cls.color, width: '92%' }]} />
                  </View>
                  <Text style={[styles.classConfText, { color: cls.color }]}>92%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'LOW': return Colors.green;
    case 'MEDIUM': return Colors.yellow;
    case 'HIGH': return Colors.orange;
    case 'CRITICAL': return Colors.red;
    default: return Colors.textSecondary;
  }
}

const feedStyles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0a0c10',
    borderWidth: 1,
    borderColor: Colors.primary,
    position: 'relative',
  },
  cctvScene: {
    flex: 1,
    backgroundColor: '#121620',
  },
  roadAsphalt: {
    flex: 1,
    backgroundColor: '#181d29',
    marginHorizontal: 20,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#374151',
    position: 'relative',
  },
  laneDividerLeft: {
    position: 'absolute',
    left: '30%',
    top: 0,
    bottom: 0,
    width: 1.5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  laneDividerCenter: {
    position: 'absolute',
    left: '60%',
    top: 0,
    bottom: 0,
    width: 1.5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  laneDividerRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    borderColor: '#4b5563',
  },

  // Vehicles inside feed
  vehicleCar: {
    position: 'absolute',
    left: '8%',
    top: 20,
    zIndex: 3,
  },
  vehicleBoundingBoxCar: {
    borderWidth: 1.5,
    borderColor: Colors.blue,
    backgroundColor: `${Colors.blue}20`,
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  vehicleTagCar: { fontSize: 7, fontWeight: '800', color: '#fff', backgroundColor: Colors.blue, paddingHorizontal: 3, borderRadius: 2 },
  vehicleSpeedTag: { fontSize: 7, color: Colors.blue, fontWeight: 'bold' },

  vehicleAmbulance: {
    position: 'absolute',
    left: '35%',
    top: 30,
    zIndex: 4,
  },
  vehicleBoundingBoxAmb: {
    borderWidth: 2,
    borderColor: Colors.emergency,
    backgroundColor: `${Colors.emergency}25`,
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  vehicleTagAmb: { fontSize: 7, fontWeight: '900', color: '#fff', backgroundColor: Colors.emergency, paddingHorizontal: 3, borderRadius: 2 },
  vehicleSpeedTagAmb: { fontSize: 7, color: Colors.emergency, fontWeight: 'bold' },

  vehicleBus: {
    position: 'absolute',
    right: '8%',
    top: 30,
    zIndex: 2,
  },
  vehicleBoundingBoxBus: {
    borderWidth: 1.5,
    borderColor: Colors.orange,
    backgroundColor: `${Colors.orange}20`,
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  vehicleTagBus: { fontSize: 7, fontWeight: '800', color: '#fff', backgroundColor: Colors.orange, paddingHorizontal: 3, borderRadius: 2 },

  vehicleTruck: {
    position: 'absolute',
    left: '8%',
    bottom: 25,
    zIndex: 2,
  },
  vehicleBoundingBoxTruck: {
    borderWidth: 1.5,
    borderColor: Colors.red,
    backgroundColor: `${Colors.red}20`,
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  vehicleTagTruck: { fontSize: 7, fontWeight: '800', color: '#fff', backgroundColor: Colors.red, paddingHorizontal: 3, borderRadius: 2 },

  vehicleBike: {
    position: 'absolute',
    left: '42%',
    bottom: 30,
    zIndex: 2,
  },
  vehicleBoundingBoxBike: {
    borderWidth: 1.5,
    borderColor: Colors.yellow,
    backgroundColor: `${Colors.yellow}20`,
    padding: 3,
    borderRadius: 4,
    alignItems: 'center',
  },
  vehicleTagBike: { fontSize: 7, fontWeight: '800', color: '#000', backgroundColor: Colors.yellow, paddingHorizontal: 3, borderRadius: 2 },
  vehicleEmojiDisplay: { fontSize: 20 },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    zIndex: 10,
  },

  topBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 11,
  },
  recChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  recText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  aiEngineBadge: {
    backgroundColor: 'rgba(0,212,170,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  aiEngineText: { fontSize: 9, fontWeight: '800', color: Colors.primary },

  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10,12,16,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 11,
  },
  camLocationText: { fontSize: 10, color: Colors.textPrimary, fontWeight: '600' },
  densityBadge: { fontSize: 9, color: Colors.primary, fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  cameraSelector: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  selectedCameraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  cameraInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cameraNameText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cameraMetaText: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  cameraDropdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cameraDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cameraDropdownItemSelected: { backgroundColor: `${Colors.primary}12` },
  cameraDropdownText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cameraDropdownTextSelected: { color: Colors.primary, fontWeight: 'bold' },

  streamCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  streamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streamTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  activeTag: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  activeTagText: { fontSize: 9, fontWeight: '800', color: Colors.primary },
  streamList: { gap: Spacing.sm },
  streamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streamEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamEmoji: { fontSize: 18 },
  streamInfo: { flex: 1, gap: 2 },
  streamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streamModel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  streamPlate: { fontSize: 10, fontWeight: 'bold', color: Colors.yellow, backgroundColor: '#000', paddingHorizontal: 4, borderRadius: 2 },
  streamMeta: { fontSize: 10, color: Colors.textMuted },
  streamConfBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  streamConfText: { fontSize: 10, fontWeight: 'bold', color: Colors.green },

  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
  },
  totalLeft: { gap: Spacing.xs },
  totalLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  totalValue: { fontSize: FontSize.hero, fontWeight: FontWeight.bold },
  totalRight: { alignItems: 'flex-end', gap: Spacing.xs },
  statusLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  densityLabel: { fontSize: FontSize.xs, color: Colors.textMuted },

  breakdownCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  breakdownTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  vehicleEmoji: { fontSize: 20 },
  vehicleLabel: { width: 80, fontSize: FontSize.xs, color: Colors.textSecondary },
  barWrapper: { flex: 1, height: 8, backgroundColor: Colors.surface, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  vehicleCount: { width: 30, textAlign: 'right', fontSize: FontSize.xs, fontWeight: 'bold' },

  classCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  classTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  classGrid: { gap: Spacing.sm },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  classEmoji: { fontSize: 16 },
  classLabel: { width: 75, fontSize: FontSize.xs, color: Colors.textPrimary },
  classConf: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  classConfBar: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  classConfFill: { height: '100%', borderRadius: 3 },
  classConfText: { width: 32, fontSize: 10, fontWeight: 'bold' },

  bottom: { height: 40 },
});