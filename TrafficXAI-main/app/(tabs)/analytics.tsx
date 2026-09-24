// TRAFFICX AI — Analytics
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getAnalyticsData } from '@/services/mockData';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function Analytics() {
  const { stats, trafficTrend } = getAnalyticsData();

  const maxVehicles = Math.max(...trafficTrend.map(t => t.vehicles));

  return (
    <ScreenShell title="ANALYTICS">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SYSTEM PERFORMANCE</Text>
          <Text style={styles.headerSub}>Today · Simulated data · Auto-refreshing</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.unit ? <Text style={styles.statUnit}>{stat.unit}</Text> : null}
              <Text style={styles.statLabel}>{stat.label}</Text>
              {typeof stat.change === 'number' ? (
                <View style={styles.changeRow}>
                  <MaterialIcons
                    name={stat.change > 0 ? 'arrow-upward' : stat.change < 0 ? 'arrow-downward' : 'remove'}
                    size={10}
                    color={stat.change > 0 ? Colors.green : stat.change < 0 ? Colors.red : Colors.textMuted}
                  />
                  <Text style={[styles.changeText, {
                    color: stat.change > 0 ? Colors.green : stat.change < 0 ? Colors.red : Colors.textMuted
                  }]}>
                    {Math.abs(stat.change)}%
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        {/* Traffic Trend Chart */}
        <SectionHeader title="Hourly Traffic Trend" subtitle="Vehicle count over the day" />
        <View style={styles.chartCard}>
          <View style={styles.chartArea}>
            {trafficTrend.map(point => (
              <View key={point.hour} style={styles.chartColumn}>
                <Text style={styles.chartValue}>{point.vehicles}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.chartBar, {
                    height: `${Math.round((point.vehicles / maxVehicles) * 100)}%` as any,
                    backgroundColor: point.vehicles >= 45 ? Colors.red :
                      point.vehicles >= 35 ? Colors.orange :
                      point.vehicles >= 25 ? Colors.yellow : Colors.green,
                  }]} />
                </View>
                <Text style={styles.chartHour}>{point.hour.split(':')[0]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Incident Breakdown */}
        <SectionHeader title="Incident Breakdown" subtitle="This session" />
        <View style={styles.incidentBreakdown}>
          {[
            { type: 'Accidents', count: 8, color: Colors.red },
            { type: 'Congestion', count: 9, color: Colors.orange },
            { type: 'Road Blocks', count: 4, color: Colors.yellow },
            { type: 'Breakdowns', count: 3, color: Colors.blue },
          ].map(item => (
            <View key={item.type} style={styles.breakdownRow}>
              <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
              <Text style={styles.breakdownType}>{item.type}</Text>
              <View style={styles.breakdownBarBg}>
                <View style={[styles.breakdownBarFill, {
                  width: `${Math.round((item.count / 24) * 100)}%` as any,
                  backgroundColor: item.color
                }]} />
              </View>
              <Text style={[styles.breakdownCount, { color: item.color }]}>{item.count}</Text>
            </View>
          ))}
        </View>

        {/* Emergency Response */}
        <SectionHeader title="Emergency Response Stats" subtitle="Performance metrics" />
        <View style={styles.responseCard}>
          {[
            { label: 'Avg Dispatch Time', value: '2.3 min', icon: '⚡', color: Colors.primary },
            { label: 'Avg Route Opt Time', value: '0.8 sec', icon: '🧠', color: Colors.yellow },
            { label: 'Corridor Activation', value: '1.2 sec', icon: '🚦', color: Colors.green },
            { label: 'Avg ETA Accuracy', value: '±1.4 min', icon: '📍', color: Colors.blue },
          ].map(metric => (
            <View key={metric.label} style={styles.metricRow}>
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  header: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, letterSpacing: 0.5 },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    width: '46%',
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  statValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  statUnit: { fontSize: FontSize.xs, color: Colors.textMuted },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  changeText: { fontSize: 10, fontWeight: FontWeight.bold },
  chartCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartArea: { flexDirection: 'row', height: 130, gap: 3, alignItems: 'flex-end' },
  chartColumn: { flex: 1, alignItems: 'center', gap: 3, height: '100%' },
  chartValue: { fontSize: 8, color: Colors.textMuted, fontWeight: '600' },
  barContainer: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  chartBar: { width: '100%', borderRadius: 3, minHeight: 4 },
  chartHour: { fontSize: 8, color: Colors.textMuted, fontWeight: '600' },
  incidentBreakdown: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownType: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 90, fontWeight: FontWeight.medium },
  breakdownBarBg: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  breakdownBarFill: { height: 8, borderRadius: 4 },
  breakdownCount: { fontSize: FontSize.base, fontWeight: FontWeight.bold, width: 24, textAlign: 'right' },
  responseCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  metricIcon: { fontSize: 18, width: 26 },
  metricLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  metricValue: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  bottom: { height: Spacing.xl },
});
