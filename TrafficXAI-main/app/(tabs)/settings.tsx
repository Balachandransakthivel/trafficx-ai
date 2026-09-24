// TRAFFICX AI — Settings
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';

interface SettingRowProps {
  label: string;
  description?: string;
  icon: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  rightLabel?: string;
  color?: string;
}

function SettingRow({ label, description, icon, value, onToggle, onPress, rightLabel, color }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && onPress ? { opacity: 0.7 } : {}]}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${color || Colors.primary}22` }]}>
        <Text style={styles.settingEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDesc}>{description}</Text> : null}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: `${Colors.primary}88` }}
          thumbColor={value ? Colors.primary : Colors.textMuted}
        />
      ) : null}
      {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} /> : null}
    </Pressable>
  );
}

export default function Settings() {
  const { resetSimulation } = useTraffic();
  const { showAlert } = useAlert();

  const [settings, setSettings] = useState({
    liveUpdates: true,
    soundAlerts: true,
    pushNotifications: false,
    darkMode: true,
    autoRoute: true,
    greenCorridorAuto: false,
    highDensityAlerts: true,
    incidentAlerts: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetSim = () => {
    showAlert('Reset Simulation', 'This will restore all roads, incidents, and vehicles to initial state.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => { resetSimulation(); showAlert('Simulation Reset', 'System returned to normal state.'); } },
    ]);
  };

  return (
    <ScreenShell title="SETTINGS">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>TA</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Traffic Authority</Text>
            <Text style={styles.profileRole}>🛡️ ADMIN · Full Access</Text>
            <Text style={styles.profileLocation}>📍 Coimbatore Traffic Control</Text>
          </View>
        </View>

        {/* Live Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LIVE DATA</Text>
          <SettingRow label="Live Traffic Updates" description="Auto-refresh every 3 seconds" icon="🔄" value={settings.liveUpdates} onToggle={() => toggle('liveUpdates')} color={Colors.primary} />
          <SettingRow label="High Density Alerts" description="Notify when road hits CRITICAL" icon="🔴" value={settings.highDensityAlerts} onToggle={() => toggle('highDensityAlerts')} color={Colors.red} />
          <SettingRow label="Incident Alerts" description="Push alerts for new incidents" icon="🚨" value={settings.incidentAlerts} onToggle={() => toggle('incidentAlerts')} color={Colors.emergency} />
        </View>

        {/* Emergency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMERGENCY SYSTEM</Text>
          <SettingRow label="Auto Route Optimization" description="Instantly calculate on ambulance dispatch" icon="🗺️" value={settings.autoRoute} onToggle={() => toggle('autoRoute')} color={Colors.blue} />
          <SettingRow label="Auto Green Corridor" description="Activate on ambulance dispatch" icon="🚦" value={settings.greenCorridorAuto} onToggle={() => toggle('greenCorridorAuto')} color={Colors.green} />
          <SettingRow label="Sound Alerts" description="Audio notification for emergencies" icon="🔔" value={settings.soundAlerts} onToggle={() => toggle('soundAlerts')} color={Colors.yellow} />
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPLICATION</Text>
          <SettingRow label="Dark Mode" description="Dark command-center theme" icon="🌑" value={settings.darkMode} onToggle={() => toggle('darkMode')} />
          <SettingRow label="City / Region" description="Coimbatore, Tamil Nadu" icon="📍" onPress={() => {}} rightLabel="Change" />
          <SettingRow label="Language" description="Interface language" icon="🌐" onPress={() => {}} rightLabel="English" />
        </View>

        {/* System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM</Text>
          <SettingRow label="Reset Simulation" description="Restore all data to initial state" icon="🔃" onPress={handleResetSim} color={Colors.orange} />
          <SettingRow label="Clear Alerts" description="Mark all notifications as read" icon="🔕" onPress={() => showAlert('Cleared', 'All alerts marked as read.')} color={Colors.textMuted} />
          <SettingRow label="About TRAFFICX AI" description="v1.0.0 · Hackathon Build" icon="ℹ️" onPress={() => {}} />
        </View>

        {/* System Info */}
        <View style={styles.systemInfo}>
          <Text style={styles.systemTitle}>SYSTEM STATUS</Text>
          {[
            { label: 'API Server', value: 'SIMULATED', color: Colors.yellow },
            { label: 'Database', value: 'LOCAL', color: Colors.yellow },
            { label: 'AI Engine', value: 'MOCK MODE', color: Colors.blue },
            { label: 'WebSocket', value: 'SIMULATED', color: Colors.yellow },
            { label: 'YOLO Model', value: 'DEMO', color: Colors.blue },
          ].map(item => (
            <View key={item.label} style={styles.systemRow}>
              <View style={[styles.systemDot, { backgroundColor: item.color }]} />
              <Text style={styles.systemLabel}>{item.label}</Text>
              <Text style={[styles.systemValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
          <Text style={styles.systemNote}>
            Connect FastAPI backend & MongoDB to switch to live mode.
          </Text>
        </View>

        <View style={styles.bottom} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.base, gap: Spacing.base },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryDim,
    borderWidth: 2, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  profileRole: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  profileLocation: { fontSize: FontSize.xs, color: Colors.textMuted },
  section: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 0,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: Radius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  settingEmoji: { fontSize: 18 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  settingDesc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  rightLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  systemInfo: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  systemTitle: { fontSize: 10, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1.5 },
  systemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  systemDot: { width: 7, height: 7, borderRadius: 4 },
  systemLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  systemValue: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6 },
  systemNote: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: Spacing.sm, lineHeight: 16,
  },
  bottom: { height: Spacing.xl },
});
