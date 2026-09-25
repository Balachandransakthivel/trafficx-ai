// TRAFFICX AI — Role Selection Screen
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

const ROLES = [
  {
    id: 'dispatcher',
    label: 'Emergency Dispatcher',
    subtitle: 'Manage ambulances, incidents & green corridors',
    icon: 'local-hospital',
    color: Colors.emergency,
    gradient: 'rgba(239,68,68,0.1)',
  },
  {
    id: 'traffic-controller',
    label: 'Traffic Controller',
    subtitle: 'Monitor signals, congestion & road status',
    icon: 'traffic',
    color: Colors.primary,
    gradient: 'rgba(37,99,235,0.1)',
  },
  {
    id: 'admin',
    label: 'System Administrator',
    subtitle: 'Full access to analytics, signals & settings',
    icon: 'admin-panel-settings',
    color: Colors.yellow,
    gradient: 'rgba(245,158,11,0.1)',
  },
];

export default function RoleSelection() {
  const router = useRouter();

  const handleSelectRole = (roleId: string) => {
    router.replace('/(tabs)/live-traffic');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.title}>Select Role</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ROLES.map((role) => (
          <Pressable
            key={role.id}
            style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
            onPress={() => handleSelectRole(role.id)}
          >
            <View style={[styles.roleIconWrap, { backgroundColor: role.gradient }]}>
              <MaterialIcons name={role.icon as any} size={28} color={role.color} />
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>{role.label}</Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </Pressable>
        ))}

        <View style={styles.bypassSection}>
          <Pressable onPress={() => router.replace('/(tabs)/live-traffic')} style={styles.bypassBtn}>
            <Text style={styles.bypassText}>Continue as Guest →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginLeft: -24,
  },
  scroll: { padding: Spacing.base, gap: Spacing.md },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleCardPressed: { opacity: 0.7 },
  roleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: { flex: 1 },
  roleLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  roleSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bypassSection: { marginTop: Spacing.md, alignItems: 'center' },
  bypassBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  bypassText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    textDecorationLine: 'underline',
  },
});