import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useTraffic } from '@/hooks/useTraffic';

const SCENARIO_STEPS = [
  { step: 0, label: 'Normal', icon: '🟢', desc: 'City status: normal' },
  { step: 1, label: 'Traffic Surge', icon: '📈', desc: 'Vehicle spike detected' },
  { step: 2, label: 'Accident', icon: '🚨', desc: 'Junction 4 incident' },
  { step: 3, label: 'Ambulance', icon: '🚑', desc: 'AMB-002 dispatched' },
  { step: 5, label: 'Green Corridor', icon: '🚦', desc: 'J1→J2→J3 cleared' },
];

export const SimulationPanel = memo(() => {
  const {
    triggerTrafficSurge, triggerAccident,
    sendAmbulance, activateGreenCorridor, resetSimulation,
    simulation
  } = useTraffic();

  const controls = [
    {
      label: 'Traffic Surge',
      icon: 'trending-up',
      emoji: '📈',
      color: Colors.yellow,
      onPress: triggerTrafficSurge,
      done: simulation.trafficSurge,
    },
    {
      label: 'Trigger Accident',
      icon: 'warning',
      emoji: '🚨',
      color: Colors.red,
      onPress: triggerAccident,
      done: simulation.accidentTriggered,
    },
    {
      label: 'Send Ambulance',
      icon: 'local-hospital',
      emoji: '🚑',
      color: Colors.emergency,
      onPress: sendAmbulance,
      done: simulation.ambulanceDeployed,
    },
    {
      label: 'Green Corridor',
      icon: 'traffic',
      emoji: '🚦',
      color: Colors.green,
      onPress: activateGreenCorridor,
      done: simulation.greenCorridorActive,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🎮</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>DEMO SIMULATION</Text>
          <Text style={styles.subtitle}>Live demo controls</Text>
        </View>
        <Pressable onPress={resetSimulation} style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.7 }]}>
          <MaterialIcons name="refresh" size={16} color={Colors.textSecondary} />
          <Text style={styles.resetLabel}>RESET</Text>
        </Pressable>
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsRow}>
        {SCENARIO_STEPS.map((s, i) => (
          <View key={s.step} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              simulation.scenarioStep >= s.step && styles.stepDotActive
            ]}>
              <Text style={styles.stepEmoji}>{simulation.scenarioStep >= s.step ? s.icon : '○'}</Text>
            </View>
            {i < SCENARIO_STEPS.length - 1 ? (
              <View style={[styles.stepLine, simulation.scenarioStep > s.step && styles.stepLineActive]} />
            ) : null}
          </View>
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {controls.map(c => (
          <Pressable
            key={c.label}
            onPress={c.onPress}
            style={({ pressed }) => [
              styles.controlBtn,
              { borderColor: c.done ? c.color : Colors.border },
              c.done && { backgroundColor: `${c.color}15` },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.controlEmoji}>{c.emoji}</Text>
            <Text style={[styles.controlLabel, c.done && { color: c.color }]}>{c.label}</Text>
            {c.done ? <MaterialIcons name="check-circle" size={14} color={c.color} /> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: { fontSize: 20 },
  headerText: { flex: 1 },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  resetLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepDotActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryDim },
  stepEmoji: { fontSize: 13 },
  stepLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginHorizontal: 2 },
  stepLineActive: { backgroundColor: Colors.primary },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  controlBtn: {
    flex: 1,
    minWidth: '44%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  controlEmoji: { fontSize: 16 },
  controlLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
});
