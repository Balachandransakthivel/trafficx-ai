// TRAFFICX AI — Incidents
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { IncidentCard } from '@/components/feature/IncidentCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { SimulationPanel } from '@/components/feature/SimulationPanel';

const FILTERS = ['ALL', 'ACTIVE', 'MONITORING', 'RESOLVED'];

export default function Incidents() {
  const { incidents } = useTraffic();
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? incidents : incidents.filter(i => i.status === filter);

  const counts = {
    ALL: incidents.length,
    ACTIVE: incidents.filter(i => i.status === 'ACTIVE').length,
    MONITORING: incidents.filter(i => i.status === 'MONITORING').length,
    RESOLVED: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <ScreenShell title="INCIDENTS">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: `${Colors.red}44` }]}>
            <Text style={[styles.summaryValue, { color: Colors.red }]}>{counts.ACTIVE}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${Colors.yellow}44` }]}>
            <Text style={[styles.summaryValue, { color: Colors.yellow }]}>{counts.MONITORING}</Text>
            <Text style={styles.summaryLabel}>Monitoring</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${Colors.green}44` }]}>
            <Text style={[styles.summaryValue, { color: Colors.green }]}>{counts.RESOLVED}</Text>
            <Text style={styles.summaryLabel}>Resolved</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Colors.border }]}>
            <Text style={[styles.summaryValue, { color: Colors.textSecondary }]}>{counts.ALL}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            >
              <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>
                {f} {counts[f as keyof typeof counts]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Incidents */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No incidents</Text>
            <Text style={styles.emptySub}>Use simulation to trigger an incident</Text>
          </View>
        ) : (
          filtered.map(incident => <IncidentCard key={incident.id} incident={incident} />)
        )}

        {/* Simulation */}
        <View style={styles.simSection}>
          <Text style={styles.simTitle}>🎮 TRIGGER INCIDENTS</Text>
          <SimulationPanel />
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm },
  summaryCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    gap: 2,
  },
  summaryValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: FontWeight.medium },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  filterBtnActive: { backgroundColor: Colors.primary },
  filterLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  filterLabelActive: { color: '#fff' },
  empty: { alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  simSection: { gap: Spacing.sm },
  simTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  bottom: { height: Spacing.xl },
});
