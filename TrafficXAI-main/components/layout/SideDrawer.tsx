import React, { memo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated,
  ScrollView, Dimensions, TouchableWithoutFeedback
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', route: '/(tabs)/' },
  { label: 'Live Map', icon: 'map', route: '/(tabs)/live-traffic' },
  { label: 'Emergency', icon: 'local-hospital', route: '/(tabs)/emergency' },
  { label: 'Incidents', icon: 'warning', route: '/(tabs)/incidents' },
  { label: 'Profile', icon: 'person', route: '/(tabs)/profile' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SideDrawer = memo(({ visible, onClose }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : -DRAWER_WIDTH,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: visible ? 1 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const navigate = (route: string) => {
    router.push(route as any);
    onClose();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.base }]}>
          <Text style={styles.appName}>🚦 TRAFFICX AI</Text>
          <Text style={styles.version}>Smart Traffic & Emergency System</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.route || (item.route !== '/(tabs)/' && pathname?.includes(item.label.toLowerCase().replace(' ', '-')));
            return (
              <Pressable
                key={item.route}
                style={({ pressed }) => [styles.navItem, isActive && styles.navItemActive, pressed && styles.navItemPressed]}
                onPress={() => navigate(item.route)}
              >
                <View style={[styles.navIconWrap, isActive && styles.navIconActive]}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={20}
                    color={isActive ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
                {isActive ? (
                  <View style={styles.activeIndicator} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.base }]}>
          <View style={styles.footerRow}>
            <View style={styles.dot} />
            <Text style={styles.footerText}>System Online — v1.0.0</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  version: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  scroll: { flex: 1, paddingTop: Spacing.sm },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: Colors.primaryDim,
  },
  navItemPressed: { opacity: 0.7 },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  navIconActive: { backgroundColor: `${Colors.primary}22` },
  navLabel: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  navLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.green },
  footerText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
