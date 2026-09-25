// TRAFFICX AI — Incident Management
import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Alert, Modal, TextInput } from 'react-native';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { IncidentCard } from '@/components/feature/IncidentCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTraffic } from '@/hooks/useTraffic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { SimulationPanel } from '@/components/feature/SimulationPanel';
import { MaterialIcons } from '@expo/vector-icons';

const INCIDENT_TYPES = [
  { type: 'ACCIDENT', emoji: '🚨', label: 'Accident', color: Colors.red },
  { type: 'ROAD_BLOCK', emoji: '🚧', label: 'Road Block', color: Colors.orange },
  { type: 'SIGNAL_FAILURE', emoji: '🚦', label: 'Signal Failure', color: Colors.yellow },
  { type: 'FLOODING', emoji: '🌧️', label: 'Flooding', color: Colors.blue },
  { type: 'CONGESTION', emoji: '🚗', label: 'Congestion', color: Colors.primary },
];

const FILTERS = ['ALL', 'ACTIVE', 'MONITORING', 'RESOLVED'];

const LOCATIONS = [
  'Avinashi Road – Signal 7',
  'NH Road – Junction 4',
  'DB Road – Bypass',
  'Trichy Road – Peelamedu',
  'Mettupalayam Road – Thudiyalur',
  'Anna Nagar – Junction 1',
  'RS Puram – Junction 2',
  'Singanallur – Junction 5',
];

export default function Incidents() {
  const { incidents, triggerAccident } = useTraffic();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'MONITORING' | 'RESOLVED'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'ACCIDENT',
    location: '',
    severity: 'MEDIUM',
    description: '',
  });
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  const filtered = filter === 'ALL' ? incidents : incidents.filter(i => i.status === filter);

  const counts = {
    ALL: incidents.length,
    ACTIVE: incidents.filter(i => i.status === 'ACTIVE').length,
    MONITORING: incidents.filter(i => i.status === 'MONITORING').length,
    RESOLVED: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  const handleResolve = (incidentId: string) => {
    Alert.alert(
      'Resolve Incident',
      'Mark this incident as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Resolve', 
          onPress: () => {
            // In a real app, this would call an API
            // For demo, we'll just show confirmation
            Alert.alert('Resolved', 'Incident marked as resolved. Road status updated.');
          }
        },
      ]
    );
  };

  const handleViewDetails = (incident: any) => {
    setSelectedIncident(incident);
  };

  const handleAddIncident = () => {
    if (!newIncident.location || !newIncident.description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // In real app: call API to create incident
    Alert.alert('Incident Created', `${newIncident.type} reported at ${newIncident.location}`);
    setModalVisible(false);
    setNewIncident({ type: 'ACCIDENT', location: '', severity: 'MEDIUM', description: '' });
  };

  const typeIcon = (type: string) => {
    const t = INCIDENT_TYPES.find(i => i.type === type);
    return t ? t.emoji : '🚨';
  };

  const typeColor = (type: string) => {
    const t = INCIDENT_TYPES.find(i => i.type === type);
    return t ? t.color : Colors.red;
  };

  return (
    <ScreenShell title="INCIDENTS">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Summary Cards */}
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

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable onPress={triggerAccident} style={styles.quickBtn}>
            <Text style={styles.quickEmoji}>🚨</Text>
            <Text style={styles.quickLabel}>Trigger Accident</Text>
          </Pressable>
          <Pressable onPress={() => setModalVisible(true)} style={styles.quickBtn}>
            <Text style={styles.quickEmoji}>➕</Text>
            <Text style={styles.quickLabel}>Add Incident</Text>
          </Pressable>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f as any)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            >
              <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>
                {f} {counts[f as keyof typeof counts]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Incidents List */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>No incidents</Text>
            <Text style={styles.emptySub}>Use simulation or add button to create incidents</Text>
          </View>
        ) : (
          filtered.map(incident => (
            <IncidentCard 
              key={incident.id} 
              incident={incident} 
              onPress={() => handleViewDetails(incident)}
              onResolve={() => handleResolve(incident.id)}
            />
          ))
        )}

        {/* Simulation Panel */}
        <View style={styles.simSection}>
          <Text style={styles.simTitle}>🎮 SIMULATION CONTROLS</Text>
          <SimulationPanel />
        </View>

        <View style={styles.bottom} />
      </ScrollView>

      {/* Add Incident Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Incident</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <MaterialIcons name="close" size={24} color={Colors.textMuted} />
              </Pressable>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Incident Type */}
              <Text style={styles.fieldLabel}>Incident Type</Text>
              <View style={styles.typeGrid}>
                {INCIDENT_TYPES.map(t => (
                  <Pressable
                    key={t.type}
                    onPress={() => setNewIncident({ ...newIncident, type: t.type })}
                    style={[
                      styles.typeBtn,
                      newIncident.type === t.type && styles.typeBtnSelected,
                      { borderColor: t.color }
                    ]}
                  >
                    <Text style={styles.typeEmoji}>{t.emoji}</Text>
                    <Text style={[styles.typeLabel, newIncident.type === t.type && { color: t.color }]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Location */}
              <Text style={styles.fieldLabel}>Location</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="location-on" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Select or type location"
                  value={newIncident.location}
                  onChangeText={v => setNewIncident({ ...newIncident, location: v })}
                />
              </View>
              <Text style={styles.hintText}>Common locations:</Text>
              <View style={styles.locationChips}>
                {LOCATIONS.map(loc => (
                  <Pressable
                    key={loc}
                    onPress={() => setNewIncident({ ...newIncident, location: loc })}
                    style={styles.locationChip}
                  >
                    <Text style={styles.locationChipText}>{loc}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Severity */}
              <Text style={styles.fieldLabel}>Severity</Text>
              <View style={styles.severityRow}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => (
                  <Pressable
                    key={s}
                    onPress={() => setNewIncident({ ...newIncident, severity: s })}
                    style={[
                      styles.severityBtn,
                      newIncident.severity === s && styles.severityBtnSelected,
                      { borderColor: getSeverityColor(s) }
                    ]}
                  >
                    <Text style={[styles.severityLabel, newIncident.severity === s && { color: getSeverityColor(s) }]}>
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Description */}
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the incident..."
                value={newIncident.description}
                onChangeText={v => setNewIncident({ ...newIncident, description: v })}
                multiline
              />

              {/* Submit */}
              <Pressable onPress={handleAddIncident} style={styles.submitBtn} disabled={!newIncident.location || !newIncident.description}>
                <Text style={[styles.submitBtnText, (!newIncident.location || !newIncident.description) && styles.submitBtnTextDisabled]}>
                  CREATE INCIDENT
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <Modal visible={!!selectedIncident} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.detailModalContainer}>
              <View style={styles.detailModalHeader}>
                <View style={styles.detailModalIconWrap}>
                  <Text style={styles.detailModalIcon}>{typeIcon(selectedIncident.type)}</Text>
                </View>
                <View style={styles.detailModalInfo}>
                  <Text style={styles.detailModalType}>{selectedIncident.type.replace('_', ' ')}</Text>
                  <Text style={styles.detailModalLocation}>{selectedIncident.location}</Text>
                </View>
                <Pressable onPress={() => setSelectedIncident(null)} style={styles.modalClose}>
                  <MaterialIcons name="close" size={24} color={Colors.textMuted} />
                </Pressable>
              </View>
              
              <ScrollView contentContainerStyle={styles.detailModalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>INCIDENT DETAILS</Text>
                  <View style={styles.detailGrid}>
                    <DetailItem label="Severity" value={selectedIncident.severity} color={getSeverityColor(selectedIncident.severity)} />
                    <DetailItem label="Traffic Impact" value={selectedIncident.trafficImpact} color={getSeverityColor(selectedIncident.trafficImpact)} />
                    <DetailItem label="Status" value={selectedIncident.status} color={getStatusColor(selectedIncident.status)} />
                    <DetailItem label="Reported" value={formatTime(selectedIncident.timestamp)} color={Colors.textSecondary} />
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>DESCRIPTION</Text>
                  <Text style={styles.detailDescription}>{selectedIncident.description}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>COORDINATES</Text>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lat:</Text>
                    <Text style={styles.coordValue}>{selectedIncident.lat.toFixed(6)}</Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>Lng:</Text>
                    <Text style={styles.coordValue}>{selectedIncident.lng.toFixed(6)}</Text>
                  </View>
                </View>

                {selectedIncident.status === 'ACTIVE' && (
                  <Pressable onPress={() => handleResolve(selectedIncident.id)} style={styles.resolveBtn}>
                    <MaterialIcons name="check-circle" size={18} color="#fff" />
                    <Text style={styles.resolveBtnText}>MARK AS RESOLVED</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </ScreenShell>
  );
}

function DetailItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailItemLabel}>{label}</Text>
      <Text style={[styles.detailItemValue, { color }]}>{value}</Text>
    </View>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'LOW': return Colors.green;
    case 'MEDIUM': return Colors.yellow;
    case 'HIGH': return Colors.orange;
    case 'CRITICAL': return Colors.red;
    default: return Colors.textSecondary;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return Colors.red;
    case 'MONITORING': return Colors.yellow;
    case 'RESOLVED': return Colors.green;
    default: return Colors.textSecondary;
  }
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  quickEmoji: { fontSize: 20 },
  quickLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalClose: { padding: Spacing.xs },
  modalContent: { padding: Spacing.md, gap: Spacing.md },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.xs },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  typeBtnSelected: { backgroundColor: Colors.primaryDim },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    height: 44,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  textArea: { height: 80, paddingTop: Spacing.sm },
  hintText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs, marginBottom: Spacing.xs },
  locationChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  locationChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationChipText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  severityRow: { flexDirection: 'row', gap: Spacing.sm },
  severityBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  severityBtnSelected: { backgroundColor: Colors.primaryDim },
  severityLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 1 },
  submitBtnTextDisabled: { opacity: 0.5 },

  // Detail Modal
  detailModalContainer: {
    backgroundColor: Colors.surface,
    margin: Spacing.base,
    borderRadius: Radius.xl,
    maxHeight: '85%',
    width: 'auto',
    alignSelf: 'center',
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailModalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalIcon: { fontSize: 24 },
  detailModalInfo: { flex: 1 },
  detailModalType: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  detailModalLocation: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  detailModalContent: { padding: Spacing.md, gap: Spacing.lg },
  detailSection: { gap: Spacing.sm },
  detailSectionTitle: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textMuted, letterSpacing: 1 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 2,
  },
  detailItemLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  detailItemValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  detailDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coordLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  coordValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.green,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  resolveBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.8 },
});