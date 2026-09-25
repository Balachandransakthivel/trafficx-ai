import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { AppHeader } from './AppHeader';
import { SideDrawer } from './SideDrawer';
import { useTraffic } from '@/hooks/useTraffic';

interface Props {
  title: string;
  children: ReactNode;
  noPadding?: boolean;
}

function NotificationsModal({ visible, onClose, alerts, onMarkAllRead }: { visible: boolean; onClose: () => void; alerts: any[]; onMarkAllRead: () => void }) {
  if (!visible) return null;

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <Pressable onPress={onMarkAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </Pressable>
              )}
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptySub}>You are all caught up</Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <Pressable
                  key={alert.id}
                  style={[
                    styles.alertItem,
                    !alert.read ? styles.alertItemUnread : null,
                  ]}
                  onPress={onClose}
                >
                  <View style={styles.alertIconWrap}>
                    <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      <Text style={[styles.alertTitle, !alert.read ? styles.alertTitleUnread : null]}>{alert.title}</Text>
                      <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                  {!alert.read ? <View style={styles.unreadDot} /> : null}
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function getAlertIcon(type: string): string {
  switch (type) {
    case 'INCIDENT': return '🚨';
    case 'EMERGENCY': return '🚑';
    case 'PREDICTION': return '📈';
    case 'CORRIDOR': return '🚦';
    default: return 'ℹ️';
  }
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ScreenShell({ title, children, noPadding = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { alerts, markAllAlertsRead } = useTraffic();

  const handleNotificationsPress = () => {
    setShowNotifications(true);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader 
          title={title} 
          onMenuPress={() => setDrawerOpen(true)} 
          onNotificationsPress={handleNotificationsPress}
        />
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </SafeAreaView>

      <SideDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        alerts={alerts}
        onMarkAllRead={markAllAlertsRead}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: { flex: 1 },
  content: { flex: 1 },
  noPadding: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '85%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flex: 1 },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  markAllBtn: {
    backgroundColor: Colors.primaryDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  markAllText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary },
  closeBtn: { padding: Spacing.xs },
  modalContent: { padding: Spacing.md, gap: Spacing.xs },
  emptyState: { alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  alertItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  alertItemUnread: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertIcon: { fontSize: 18 },
  alertContent: { flex: 1, gap: Spacing.xs },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  alertTitleUnread: { fontWeight: FontWeight.bold },
  alertTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  alertMessage: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  unreadDot: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
