import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useTraffic } from '@/hooks/useTraffic';

interface Props {
  title: string;
  onMenuPress: () => void;
  onNotificationsPress: () => void;
}

export const AppHeader = memo(({ title, onMenuPress, onNotificationsPress }: Props) => {
  const insets = useSafeAreaInsets();
  const { unreadAlerts, isLive } = useTraffic();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <Pressable onPress={onMenuPress} style={styles.menuBtn} hitSlop={8}>
        <MaterialIcons name="menu" size={24} color={Colors.textPrimary} />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.logo}>🚦</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.right}>
        <View style={[styles.liveChip, isLive && styles.liveActive]}>
          <View style={[styles.liveDot, isLive && styles.liveDotActive]} />
          <Text style={[styles.liveText, isLive && styles.liveTextActive]}>LIVE</Text>
        </View>
        <Pressable onPress={onNotificationsPress} style={styles.alertBtn} hitSlop={8}>
          <MaterialIcons name="notifications" size={22} color={Colors.textSecondary} />
          {unreadAlerts > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadAlerts > 9 ? '9+' : unreadAlerts}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  menuBtn: {
    padding: Spacing.xs,
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: { fontSize: 18 },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 4,
  },
  liveActive: { backgroundColor: '#22c55e18', borderWidth: 1, borderColor: '#22c55e44' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  liveDotActive: { backgroundColor: Colors.green },
  liveText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8 },
  liveTextActive: { color: Colors.green },
  alertBtn: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.red,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 8, fontWeight: '700', color: '#fff' },
});
