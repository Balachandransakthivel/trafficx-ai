// TRAFFICX AI — AI Vehicle Detection Monitor
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Animated } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { getStatusColor } from '@/services/mockData';
import { Image } from 'expo-image';

function DetectionFeed({ detection }: { detection: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const statusColor = getStatusColor(detection.trafficStatus);

  return (
    <View style={feedStyles.container}>
      <Image
        source={require('@/assets/images/ai_detection.png')}
        style={feedStyles.feedImage}
        contentFit="cover"
        transition={300}
      />

      {/* Scan Line Animation */}
      <Animated.View style={[feedStyles.scanLine, {
        transform: [{
          translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] })
        }]
      }]} />

      {/* Detection Boxes Overlay */}
      <View style={feedStyles.overlay}>
        {/* Detection boxes */}
        <View style={[feedStyles.bbox, { top: 30, left: 20, width: 60, height: 40 }]}>
          <Text style={feedStyles.bboxLabel}>CAR 94%</Text>
        </View>
        <View style={[feedStyles.bbox, { top: 80, left: 100, width: 55, height: 38 }]}>
          <Text style={feedStyles.bboxLabel}>CAR 91%</Text>
        </View>
        <View style={[feedStyles.bbox, { top: 40, right: 30, width: 80, height: 50 }, feedStyles.bboxBus]}>
          <Text style={feedStyles.bboxLabel}>BUS 88%</Text>
        </View>
        <View style={[feedStyles.bbox, { bottom: 40, left: 40, width: 40, height: 30 }, feedStyles.bboxBike]}>
          <Text style={feedStyles.bboxLabel}>BIKE 96%</Text>
        </View>

        {/* AI Label */}
        <View style={feedStyles.aiLabel}>
          <Animated.View style={[feedStyles.aiDot, { opacity: pulseAnim }]} />
          <Text style={feedStyles.aiText}>YOLO v8 ACTIVE</Text>
        </View>

        {/* Confidence */}
        <View style={feedStyles.confChip}>
          <Text style={feedStyles.confText}>Conf: {detection.confidence.toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
}

export default function AIMonitor() {
  const { detection } = useTraffic();
  const statusColor = getStatusColor(detection.trafficStatus);

  const vehicleTypes = [
    { label: 'Cars', value: detection.cars, emoji: '🚗', color: Colors.blue },
    { label: 'Bikes', value: detection.bikes, emoji: '🏍️', color: Colors.yellow },
    { label: 'Buses', value: detection.buses, emoji: '🚌', color: Colors.orange },
    { label: 'Trucks', value: detection.trucks, emoji: '🚚', color: Colors.red },
  ];

  if (detection.ambulances > 0) {
    vehicleTypes.push({ label: 'Ambulance', value: detection.ambulances, emoji: '🚑', color: Colors.emergency });
  }

  return (
    <ScreenShell title="AI MONITOR">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Live Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedTitle}>📹 LIVE CAMERA FEED</Text>
            <View style={styles.recordingDot}><View style={styles.recordDotInner} /><Text style={styles.recordText}>REC</Text></View>
          </View>
          <DetectionFeed detection={detection} />
        </View>

        {/* Total Count */}
        <View style={[styles.totalCard, { borderColor: `${statusColor}44`, backgroundColor: `${statusColor}10` }]}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalLabel}>VEHICLES DETECTED</Text>
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
          <Text style={styles.breakdownTitle}>VEHICLE BREAKDOWN</Text>
          {vehicleTypes.map(v => (
            <View key={v.label} style={styles.vehicleRow}>
              <Text style={styles.vehicleEmoji}>{v.emoji}</Text>
              <Text style={styles.vehicleLabel}>{v.label}</Text>
              <View style={styles.barWrapper}>
                <View style={[styles.barFill, {
                  width: `${Math.round((v.value / detection.totalVehicles) * 100)}%` as any,
                  backgroundColor: v.color
                }]} />
              </View>
              <Text style={[styles.vehicleCount, { color: v.color }]}>{v.value}</Text>
            </View>
          ))}
        </View>

        {/* Density Gauge */}
        <View style={styles.gaugeCard}>
          <Text style={styles.gaugeTitle}>TRAFFIC DENSITY GAUGE</Text>
          <View style={styles.gaugeBg}>
            <View style={[styles.gaugeFill, {
              width: `${detection.density}%` as any,
              backgroundColor: statusColor
            }]} />
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLow}>0 — 🟢 LOW</Text>
            <Text style={styles.gaugeMid}>25 — 🟡</Text>
            <Text style={styles.gaugeHigh}>🔴 CRITICAL — 100</Text>
          </View>
          <Text style={[styles.gaugeValue, { color: statusColor }]}>{detection.density}% density</Text>
        </View>

        {/* AI Info */}
        <View style={styles.aiInfoCard}>
          <Text style={styles.aiInfoTitle}>🤖 AI DETECTION ENGINE</Text>
          <View style={styles.aiInfoGrid}>
            {[
              { label: 'Model', value: 'YOLOv8n' },
              { label: 'Confidence', value: `${detection.confidence.toFixed(1)}%` },
              { label: 'FPS', value: '24' },
              { label: 'Camera', value: 'CCTV-04' },
              { label: 'Classes', value: '6 types' },
              { label: 'Backend', value: 'OpenCV' },
            ].map(info => (
              <View key={info.label} style={styles.aiInfoItem}>
                <Text style={styles.aiInfoLabel}>{info.label}</Text>
                <Text style={styles.aiInfoValue}>{info.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const feedStyles = StyleSheet.create({
  container: {
    height: 240,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: Colors.primary,
    position: 'relative',
  },
  feedImage: { ...StyleSheet.absoluteFillObject, opacity: 0.85 },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    backgroundColor: `${Colors.primary}99`,
    zIndex: 2,
  },
  overlay: { ...StyleSheet.absoluteFillObject, padding: 8 },
  bbox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  bboxBus: { borderColor: Colors.yellow, backgroundColor: `${Colors.yellow}10` },
  bboxBike: { borderColor: Colors.orange, backgroundColor: `${Colors.orange}10` },
  bboxLabel: {
    position: 'absolute',
    top: -14,
    left: 0,
    fontSize: 8,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  aiLabel: {
    position: 'absolute',
    bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  aiDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  aiText: { fontSize: 9, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  confChip: {
    position: 'absolute',
    bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  confText: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  feedSection: { gap: Spacing.sm },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  recordingDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordDotInner: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.red },
  recordText: { fontSize: 10, color: Colors.red, fontWeight: '800', letterSpacing: 1 },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  totalLeft: {},
  totalLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  totalValue: { fontSize: 48, fontWeight: FontWeight.extrabold },
  totalRight: { alignItems: 'flex-end', gap: 4 },
  statusLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  densityLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  breakdownCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  breakdownTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2, marginBottom: 4 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  vehicleEmoji: { fontSize: 18, width: 24 },
  vehicleLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 52, fontWeight: FontWeight.medium },
  barWrapper: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  vehicleCount: { fontSize: FontSize.md, fontWeight: FontWeight.bold, width: 30, textAlign: 'right' },
  gaugeCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  gaugeTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  gaugeBg: { height: 16, backgroundColor: Colors.border, borderRadius: 8, overflow: 'hidden' },
  gaugeFill: { height: 16, borderRadius: 8 },
  gaugeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  gaugeLow: { fontSize: 9, color: Colors.green, fontWeight: '600' },
  gaugeMid: { fontSize: 9, color: Colors.yellow, fontWeight: '600' },
  gaugeHigh: { fontSize: 9, color: Colors.red, fontWeight: '600' },
  gaugeValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold, textAlign: 'center' },
  aiInfoCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  aiInfoTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  aiInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  aiInfoItem: {
    width: '30%',
    flex: 1,
    minWidth: 80,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 2,
  },
  aiInfoLabel: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.4 },
  aiInfoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  bottom: { height: Spacing.xl },
});
