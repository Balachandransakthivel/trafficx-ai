// TRAFFICX AI — Live Traffic Map
import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { RoadStatusCard } from '@/components/feature/RoadStatusCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { getStatusColor } from '@/services/mockData';
import { TrafficStatus } from '@/types/traffic';

const STATUS_EMOJI: Record<TrafficStatus, string> = {
  LOW: '🟢', MEDIUM: '🟡', HIGH: '🟠', CRITICAL: '🔴',
};

function SchematicMap() {
  const { roads, incidents, vehicles, simulation } = useTraffic();

  const getLineColor = (status: TrafficStatus) => getStatusColor(status);

  return (
    <View style={schemaStyles.container}>
      <Text style={schemaStyles.title}>CITY ROAD NETWORK</Text>

      {/* City Grid Representation */}
      <View style={schemaStyles.grid}>
        {/* Row 1 */}
        <View style={schemaStyles.row}>
          <View style={schemaStyles.junctionDot}><Text style={schemaStyles.jLabel}>J1</Text></View>
          <View style={[schemaStyles.road, { backgroundColor: getLineColor(roads[0]?.status || 'LOW') }]} />
          <View style={schemaStyles.junctionDot}><Text style={schemaStyles.jLabel}>J3</Text></View>
        </View>

        {/* Vertical */}
        <View style={schemaStyles.vertRow}>
          <View style={[schemaStyles.vRoad, { backgroundColor: getLineColor(roads[3]?.status || 'LOW') }]} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            {simulation.accidentTriggered ? (
              <View style={schemaStyles.accidentMarker}>
                <Text style={schemaStyles.accidentText}>🚨 INCIDENT</Text>
              </View>
            ) : null}
          </View>
          <View style={[schemaStyles.vRoad, { backgroundColor: getLineColor(roads[4]?.status || 'LOW') }]} />
        </View>

        {/* Row 2 */}
        <View style={schemaStyles.row}>
          <View style={schemaStyles.junctionDot}><Text style={schemaStyles.jLabel}>J2</Text></View>
          <View style={[schemaStyles.road, { backgroundColor: getLineColor(roads[1]?.status || 'LOW') }]} />
          <View style={schemaStyles.junctionDot}><Text style={schemaStyles.jLabel}>J4</Text></View>
        </View>

        {/* Row 3 */}
        <View style={schemaStyles.row}>
          <View style={{ width: 36 }} />
          <View style={[schemaStyles.road, { flex: 0.5, backgroundColor: getLineColor(roads[2]?.status || 'LOW') }]} />
          <View style={schemaStyles.junctionDot}><Text style={schemaStyles.jLabel}>J5</Text></View>
        </View>

        {/* Ambulance */}
        {simulation.ambulanceDeployed || vehicles.some(v => v.status !== 'STANDBY') ? (
          <View style={schemaStyles.ambulanceOverlay}>
            <Text style={schemaStyles.ambulanceEmoji}>🚑</Text>
          </View>
        ) : null}

        {/* Hospital */}
        <View style={schemaStyles.hospitalRow}>
          <View style={schemaStyles.hospitalDot}>
            <Text style={schemaStyles.hospitalEmoji}>🏥</Text>
            <Text style={schemaStyles.hospitalLabel}>Govt Hospital</Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={schemaStyles.legend}>
        {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TrafficStatus[]).map(s => (
          <View key={s} style={schemaStyles.legendItem}>
            <View style={[schemaStyles.legendDot, { backgroundColor: getLineColor(s) }]} />
            <Text style={schemaStyles.legendLabel}>{STATUS_EMOJI[s]} {s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function LiveTraffic() {
  const { roads } = useTraffic();

  const grouped = useMemo(() => ({
    CRITICAL: roads.filter(r => r.status === 'CRITICAL'),
    HIGH: roads.filter(r => r.status === 'HIGH'),
    MEDIUM: roads.filter(r => r.status === 'MEDIUM'),
    LOW: roads.filter(r => r.status === 'LOW'),
  }), [roads]);

  return (
    <ScreenShell title="LIVE TRAFFIC">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SchematicMap />

        {/* Summary */}
        <View style={styles.summaryRow}>
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TrafficStatus[]).map(s => (
            <View key={s} style={[styles.summaryCard, { borderColor: `${getStatusColor(s)}44` }]}>
              <Text style={[styles.summaryCount, { color: getStatusColor(s) }]}>{grouped[s].length}</Text>
              <Text style={styles.summaryLabel}>{STATUS_EMOJI[s]}</Text>
              <Text style={styles.summaryStatus}>{s}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="All Roads" subtitle={`${roads.length} roads monitored`} />
        {roads.map(road => (
          <RoadStatusCard key={road.id} road={road} />
        ))}
        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const schemaStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5, textAlign: 'center' },
  grid: { minHeight: 200, gap: Spacing.sm, position: 'relative', paddingHorizontal: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  junctionDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  jLabel: { fontSize: 9, fontWeight: '800', color: Colors.primary },
  road: { flex: 1, height: 4, borderRadius: 2 },
  vertRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  vRoad: { width: 4, height: 50, borderRadius: 2, marginHorizontal: 16 },
  accidentMarker: {
    alignSelf: 'center',
    backgroundColor: Colors.redBg,
    borderWidth: 1, borderColor: Colors.red,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  accidentText: { fontSize: 10, color: Colors.red, fontWeight: '800' },
  ambulanceOverlay: {
    position: 'absolute', top: 60, left: 90,
  },
  ambulanceEmoji: { fontSize: 24 },
  hospitalRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  hospitalDot: { alignItems: 'center', gap: 2 },
  hospitalEmoji: { fontSize: 24 },
  hospitalLabel: { fontSize: 9, color: Colors.green, fontWeight: '700' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4, borderTopWidth: 1, borderTopColor: Colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },
});

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.sm },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  summaryCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md, padding: Spacing.sm,
    borderWidth: 1,
    gap: 2,
  },
  summaryCount: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: 16 },
  summaryStatus: { fontSize: 9, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  bottom: { height: Spacing.xl },
});
