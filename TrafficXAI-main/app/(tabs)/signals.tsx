// TRAFFICX AI — Traffic Signals
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { SignalCard } from '@/components/feature/SignalCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function Signals() {
  const { signals, simulation, activateGreenCorridor } = useTraffic();

  const greenCount = signals.filter(s => s.state === 'GREEN').length;
  const redCount = signals.filter(s => s.state === 'RED').length;
  const yellowCount = signals.filter(s => s.state === 'YELLOW').length;
  const corridorCount = signals.filter(s => s.greenCorridor).length;

  return (
    <ScreenShell title="TRAFFIC SIGNALS">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Signal Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: `${Colors.green}44` }]}>
            <Text style={styles.signalEmoji}>🟢</Text>
            <Text style={[styles.summaryCount, { color: Colors.green }]}>{greenCount}</Text>
            <Text style={styles.summaryLabel}>Green</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${Colors.yellow}44` }]}>
            <Text style={styles.signalEmoji}>🟡</Text>
            <Text style={[styles.summaryCount, { color: Colors.yellow }]}>{yellowCount}</Text>
            <Text style={styles.summaryLabel}>Yellow</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${Colors.red}44` }]}>
            <Text style={styles.signalEmoji}>🔴</Text>
            <Text style={[styles.summaryCount, { color: Colors.red }]}>{redCount}</Text>
            <Text style={styles.summaryLabel}>Red</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: `${Colors.primary}44` }]}>
            <Text style={styles.signalEmoji}>🚦</Text>
            <Text style={[styles.summaryCount, { color: Colors.primary }]}>{corridorCount}</Text>
            <Text style={styles.summaryLabel}>Corridor</Text>
          </View>
        </View>

        {/* Green Corridor Status */}
        {simulation.greenCorridorActive ? (
          <View style={styles.corridorActive}>
            <Text style={styles.corridorTitle}>🚦 GREEN CORRIDOR ACTIVE</Text>
            <Text style={styles.corridorSub}>Signals J1→J2→J3 set to GREEN for AMB-001</Text>
            <Text style={styles.corridorSub}>All other junctions: 🔴 RED</Text>
          </View>
        ) : (
          <Pressable
            onPress={activateGreenCorridor}
            style={({ pressed }) => [styles.activateBtn, pressed && { opacity: 0.8 }]}
          >
            <MaterialIcons name="traffic" size={20} color={Colors.green} />
            <Text style={styles.activateBtnText}>ACTIVATE GREEN CORRIDOR</Text>
          </Pressable>
        )}

        {/* Corridor Signals First */}
        {corridorCount > 0 ? (
          <>
            <SectionHeader title="Corridor Signals" subtitle="Priority route active" />
            {signals.filter(s => s.greenCorridor).map(s => <SignalCard key={s.id} signal={s} />)}
          </>
        ) : null}

        {/* All Signals */}
        <SectionHeader title="All Junctions" subtitle={`${signals.length} monitored`} />
        {signals.map(s => <SignalCard key={s.id} signal={s} />)}

        {/* Signal Legend */}
        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>SIGNAL STATES</Text>
          {[
            { icon: '🟢', label: 'GREEN', desc: 'Clear to pass, normal or priority route' },
            { icon: '🟡', label: 'YELLOW', desc: 'Caution, prepare to stop' },
            { icon: '🔴', label: 'RED', desc: 'Stop, cross-traffic flowing' },
          ].map(item => (
            <View key={item.label} style={styles.legendRow}>
              <Text style={styles.legendIcon}>{item.icon}</Text>
              <View style={styles.legendText}>
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendDesc}>{item.desc}</Text>
              </View>
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
  signalEmoji: { fontSize: 20 },
  summaryCount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: FontWeight.medium },
  corridorActive: {
    backgroundColor: `${Colors.green}10`,
    borderWidth: 1,
    borderColor: `${Colors.green}44`,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: 4,
  },
  corridorTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.green, letterSpacing: 0.5 },
  corridorSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.greenBg,
    borderWidth: 1,
    borderColor: `${Colors.green}44`,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
  activateBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.green, letterSpacing: 0.8 },
  legendCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  legendTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendIcon: { fontSize: 20, width: 28 },
  legendText: { flex: 1 },
  legendLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  legendDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },
  bottom: { height: Spacing.xl },
});
