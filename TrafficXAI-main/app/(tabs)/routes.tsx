// TRAFFICX AI — Route Optimizer
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { RouteCard } from '@/components/feature/RouteCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

export default function Routes() {
  const { routes } = useTraffic();
  const recommended = routes.find(r => r.recommended);

  return (
    <ScreenShell title="ROUTE OPTIMIZER">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Algorithm Info */}
        <View style={styles.algoCard}>
          <Text style={styles.algoTitle}>🧠 ROUTE COST ALGORITHM</Text>
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
          <Text style={styles.algoNote}>Lower score = better route for emergency vehicles</Text>
        </View>

        {/* Recommended */}
        {recommended ? (
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <Text style={styles.recommendedTitle}>⭐ AI SELECTED ROUTE</Text>
            </View>
            <RouteCard route={recommended} />
          </View>
        ) : null}

        {/* All Routes */}
        <SectionHeader title="All Route Options" subtitle={`${routes.length} routes analyzed`} />
        {routes.map(r => <RouteCard key={r.id} route={r} />)}

        {/* Route Insight */}
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>📊 ROUTE INSIGHTS</Text>
          <Text style={styles.insightText}>
            Route C selected due to lowest traffic density (LOW) despite being 1.6 km longer than Route A.
            Incident risk on Route A adds critical penalty. Estimated time savings: ~10 minutes vs Route A.
          </Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsItem}>
              <Text style={[styles.savingsValue, { color: Colors.green }]}>~10 min</Text>
              <Text style={styles.savingsLabel}>Time Saved</Text>
            </View>
            <View style={styles.savingsItem}>
              <Text style={[styles.savingsValue, { color: Colors.primary }]}>Score 28</Text>
              <Text style={styles.savingsLabel}>Optimal Cost</Text>
            </View>
            <View style={styles.savingsItem}>
              <Text style={[styles.savingsValue, { color: Colors.yellow }]}>6.8 km</Text>
              <Text style={styles.savingsLabel}>Distance</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  algoCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  algoTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  formulaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  formulaItem: { flex: 1, alignItems: 'center', gap: 2 },
  formulaValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  formulaLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  formulaPlus: { fontSize: FontSize.xl, color: Colors.textMuted, fontWeight: '300' },
  formulaEquals: { fontSize: FontSize.xl, color: Colors.textMuted },
  algoNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  recommendedSection: { gap: Spacing.sm },
  recommendedHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm,
  },
  recommendedTitle: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.green, letterSpacing: 0.8 },
  insightCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  insightTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  insightText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  savingsRow: { flexDirection: 'row', gap: Spacing.base },
  savingsItem: { flex: 1, alignItems: 'center', gap: 2 },
  savingsValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  savingsLabel: { fontSize: 10, color: Colors.textMuted },
  bottom: { height: Spacing.xl },
});
