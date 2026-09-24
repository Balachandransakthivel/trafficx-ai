// TRAFFICX AI — Traffic Predictions
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { getStatusColor, getTrafficPredictions } from '@/services/mockData';
import { TrafficStatus } from '@/types/traffic';

const STATUS_EMOJI: Record<TrafficStatus, string> = {
  LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴',
};

function PredictionRow({ pred }: { pred: ReturnType<typeof getTrafficPredictions>[0] }) {
  const c30 = getStatusColor(pred.prediction30min);
  const c60 = getStatusColor(pred.prediction60min);
  const worsening = pred.prediction30min !== pred.currentStatus;

  return (
    <View style={predStyles.card}>
      <View style={predStyles.header}>
        <Text style={predStyles.roadName}>{pred.roadName}</Text>
        {worsening ? <Text style={predStyles.warningTag}>⚠️ WORSENING</Text> : null}
      </View>

      <View style={predStyles.timeline}>
        <View style={predStyles.timeStep}>
          <Text style={predStyles.timeLabel}>Now</Text>
          <StatusBadge status={pred.currentStatus} compact />
        </View>

        <View style={predStyles.arrow}>
          <View style={predStyles.arrowLine} />
          <Text style={predStyles.arrowTip}>→</Text>
        </View>

        <View style={predStyles.timeStep}>
          <Text style={predStyles.timeLabel}>+30 min</Text>
          <StatusBadge status={pred.prediction30min} compact />
        </View>

        <View style={predStyles.arrow}>
          <View style={predStyles.arrowLine} />
          <Text style={predStyles.arrowTip}>→</Text>
        </View>

        <View style={predStyles.timeStep}>
          <Text style={predStyles.timeLabel}>+60 min</Text>
          <StatusBadge status={pred.prediction60min} compact />
        </View>
      </View>

      <View style={predStyles.footer}>
        <View style={predStyles.footerItem}>
          <Text style={predStyles.footerLabel}>Peak Hour</Text>
          <Text style={predStyles.footerValue}>{pred.peakHour}</Text>
        </View>
        <View style={predStyles.footerItem}>
          <Text style={predStyles.footerLabel}>AI Confidence</Text>
          <Text style={[predStyles.footerValue, { color: Colors.primary }]}>{pred.confidence}%</Text>
        </View>
      </View>

      {/* Confidence Bar */}
      <View style={predStyles.confBg}>
        <View style={[predStyles.confFill, { width: `${pred.confidence}%` as any, backgroundColor: Colors.primary }]} />
      </View>
    </View>
  );
}

export default function Predictions() {
  const predictions = getTrafficPredictions();

  const highRisk = predictions.filter(p => p.prediction30min === 'CRITICAL' || p.prediction30min === 'HIGH').length;

  return (
    <ScreenShell title="PREDICTIONS">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header Alert */}
        {highRisk > 0 ? (
          <View style={styles.alertBanner}>
            <Text style={styles.alertIcon}>📈</Text>
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>TRAFFIC BUILD-UP PREDICTED</Text>
              <Text style={styles.alertSub}>{highRisk} road(s) expecting HIGH or CRITICAL traffic in 30 min</Text>
            </View>
          </View>
        ) : null}

        {/* Model Info */}
        <View style={styles.modelCard}>
          <Text style={styles.modelTitle}>🤖 AI PREDICTION ENGINE</Text>
          <View style={styles.modelGrid}>
            {[
              { label: 'Model', value: 'TimeSeries AI' },
              { label: 'Features', value: 'Hour · Day · Volume' },
              { label: 'Horizon', value: '60 minutes' },
              { label: 'Accuracy', value: '~84%' },
            ].map(m => (
              <View key={m.label} style={styles.modelItem}>
                <Text style={styles.modelLabel}>{m.label}</Text>
                <Text style={styles.modelValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <SectionHeader title="Road-by-Road Forecast" subtitle="Next 60 minutes" />
        {predictions.map(p => <PredictionRow key={p.roadName} pred={p} />)}

        {/* Density Chart (text-based) */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📊 PREDICTED CITY TRAFFIC TREND</Text>
          <View style={styles.chartArea}>
            {[
              { time: 'Now', level: 60 },
              { time: '+10', level: 65 },
              { time: '+20', level: 72 },
              { time: '+30', level: 84 },
              { time: '+40', level: 88 },
              { time: '+50', level: 82 },
              { time: '+60', level: 76 },
            ].map(point => (
              <View key={point.time} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View style={[styles.chartBar, {
                    height: `${point.level}%` as any,
                    backgroundColor: point.level >= 80 ? Colors.red : point.level >= 60 ? Colors.yellow : Colors.green,
                  }]} />
                </View>
                <Text style={styles.chartTime}>{point.time}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>Predicted avg city density over next 60 minutes</Text>
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const predStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roadName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  warningTag: { fontSize: 10, color: Colors.yellow, fontWeight: '800', letterSpacing: 0.4 },
  timeline: { flexDirection: 'row', alignItems: 'center' },
  timeStep: { alignItems: 'center', gap: 4, flex: 1 },
  timeLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.semibold },
  arrow: { flexDirection: 'row', alignItems: 'center', flex: 0.4 },
  arrowLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  arrowTip: { fontSize: 12, color: Colors.textMuted },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  footerItem: { gap: 2 },
  footerLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 0.5 },
  footerValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  confBg: { height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  confFill: { height: 3, borderRadius: 2 },
});

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.yellow}10`,
    borderWidth: 1,
    borderColor: `${Colors.yellow}44`,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  alertIcon: { fontSize: 28 },
  alertText: { flex: 1 },
  alertTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.yellow },
  alertSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  modelCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  modelTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  modelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  modelItem: { flex: 1, minWidth: 120, backgroundColor: Colors.surface, borderRadius: Radius.sm, padding: Spacing.sm, gap: 2 },
  modelLabel: { fontSize: 9, color: Colors.textMuted },
  modelValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  chartCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  chartTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  chartArea: { flexDirection: 'row', height: 100, gap: 4, alignItems: 'flex-end' },
  chartColumn: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  barContainer: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  chartBar: { width: '100%', borderRadius: 3, minHeight: 4 },
  chartTime: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },
  chartNote: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  bottom: { height: Spacing.xl },
});
