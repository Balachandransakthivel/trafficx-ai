import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TrafficSignal } from '@/types/traffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

const SIGNAL_COLORS = {
  GREEN: Colors.green,
  YELLOW: Colors.yellow,
  RED: Colors.red,
};

interface Props {
  signal: TrafficSignal;
}

export const SignalCard = memo(({ signal }: Props) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (signal.greenCorridor && signal.state === 'GREEN') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [signal.greenCorridor, signal.state]);

  const color = SIGNAL_COLORS[signal.state];

  return (
    <View style={[styles.card, signal.greenCorridor && styles.cardCorridor]}>
      <Animated.View style={[styles.signalLight, { backgroundColor: color, transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.signalIcon}>
          {signal.state === 'GREEN' ? '🟢' : signal.state === 'YELLOW' ? '🟡' : '🔴'}
        </Text>
      </Animated.View>

      <View style={styles.info}>
        <Text style={styles.junctionName} numberOfLines={1}>{signal.junctionName}</Text>
        <Text style={[styles.state, { color }]}>{signal.state}</Text>
        {signal.greenCorridor ? (
          <Text style={styles.corridorTag}>🚦 CORRIDOR</Text>
        ) : null}
      </View>

      <View style={styles.vehicleCount}>
        <Text style={styles.count}>{signal.vehicleCount}</Text>
        <Text style={styles.countLabel}>vehicles</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCorridor: {
    borderColor: `${Colors.green}44`,
    backgroundColor: `${Colors.green}08`,
  },
  signalLight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  signalIcon: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  junctionName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  state: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  corridorTag: { fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold, letterSpacing: 0.4 },
  vehicleCount: { alignItems: 'center' },
  count: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  countLabel: { fontSize: 10, color: Colors.textMuted },
});
