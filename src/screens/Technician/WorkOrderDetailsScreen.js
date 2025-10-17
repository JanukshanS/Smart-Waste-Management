import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import * as technicianApi from '../../api/technicianApi';

// TODO: Get technician ID from AuthContext after login implementation
// For now, using hardcoded ID from technicianApi.TECHNICIAN_ID

const WorkOrderDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [workOrder, setWorkOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkOrderDetails();
    }
  }, [id]);

  const fetchWorkOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await technicianApi.getWorkOrderDetails(id);
      
      if (response.success) {
        setWorkOrder(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch work order details');
        router.back();
      }
    } catch (error) {
      console.error('Fetch work order details error:', error);
      Alert.alert('Error', 'Failed to load work order details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorkOrder = () => {
    Alert.alert(
      'Assign Work Order',
      'Assign this work order to yourself?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: assignWorkOrder,
        },
      ]
    );
  };

  const assignWorkOrder = async () => {
    try {
      setUpdating(true);
      const response = await technicianApi.assignWorkOrder(id);
      
      if (response.success) {
        Alert.alert('Success', 'Work order assigned successfully');
        fetchWorkOrderDetails(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to assign work order');
      }
    } catch (error) {
      console.error('Assign work order error:', error);
      Alert.alert('Error', 'Failed to assign work order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStartWorkOrder = () => {
    Alert.alert(
      'Start Work',
      'Start working on this work order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: startWorkOrder,
        },
      ]
    );
  };

  const startWorkOrder = async () => {
    try {
      setUpdating(true);
      const response = await technicianApi.startWorkOrder(id);
      
      if (response.success) {
        Alert.alert('Success', 'Work order started successfully');
        fetchWorkOrderDetails(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to start work order');
      }
    } catch (error) {
      console.error('Start work order error:', error);
      Alert.alert('Error', 'Failed to start work order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Change work order status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => updateWorkOrderStatus(newStatus),
        },
      ]
    );
  };

  const updateWorkOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await technicianApi.updateWorkOrder(id, {
        status: newStatus,
      });
      
      if (response.success) {
        Alert.alert('Success', 'Work order status updated successfully');
        fetchWorkOrderDetails(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to update work order');
      }
    } catch (error) {
      console.error('Update work order error:', error);
      Alert.alert('Error', 'Failed to update work order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Status configuration
  const statusColors = {
    pending: { bg: COLORS.warningBg, text: COLORS.warningText, label: 'Pending', icon: '⏳' },
    'in-progress': { bg: '#E3F2FD', text: '#1976D2', label: 'In Progress', icon: '🔧' },
    completed: { bg: COLORS.successBg, text: COLORS.successText, label: 'Completed', icon: '✅' },
    escalated: { bg: COLORS.dangerBg, text: COLORS.dangerText, label: 'Escalated', icon: '⚠️' },
  };

  // Priority configuration
  const priorityColors = {
    low: { bg: '#E8F5E9', text: '#388E3C', icon: '🟢' },
    medium: { bg: '#FFF3E0', text: '#F57C00', icon: '🟡' },
    high: { bg: '#FFEBEE', text: '#C62828', icon: '🔴' },
  };

  // Issue type icons
  const issueTypeIcons = {
    'battery-low': '🔋',
    'sensor-malfunction': '⚠️',
    'connectivity-issue': '📡',
    'physical-damage': '🔧',
    'software-error': '💻',
    'other': '🛠️',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatIssueType = (type) => {
    return type?.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'N/A';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.roleTechnician} />
        <Text style={styles.loadingText}>Loading work order details...</Text>
      </View>
    );
  }

  if (!workOrder) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Work order not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const statusConfig = statusColors[workOrder.status] || statusColors.pending;
  const priorityConfig = priorityColors[workOrder.priority] || priorityColors.medium;
  const issueIcon = issueTypeIcons[workOrder.issueType] || '🛠️';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconLarge}>
          <Text style={styles.iconText}>{issueIcon}</Text>
        </View>
        <Text style={styles.workOrderId}>#{workOrder.workOrderId}</Text>
        
        <View style={styles.badgesContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.text }]}>
            <Text style={styles.badgeIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.badgeText, { color: statusConfig.text }]}>
              {statusConfig.label}
            </Text>
          </View>
          
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg, borderColor: priorityConfig.text }]}>
            <Text style={styles.badgeIcon}>{priorityConfig.icon}</Text>
            <Text style={[styles.badgeText, { color: priorityConfig.text }]}>
              {workOrder.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Issue Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Issue Details</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🛠️ Issue Type</Text>
          <Text style={styles.infoValue}>{formatIssueType(workOrder.issueType)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📝 Description</Text>
          <Text style={styles.infoValue}>{workOrder.issueDescription}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⚙️ Action Taken</Text>
          <Text style={styles.infoValue}>
            {workOrder.actionTaken === 'none' ? 'No action yet' : workOrder.actionTaken}
          </Text>
        </View>

        {workOrder.resolutionNotes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📋 Resolution Notes</Text>
            <Text style={styles.infoValue}>{workOrder.resolutionNotes}</Text>
          </View>
        )}
      </View>

      {/* Device Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Device ID</Text>
          <Text style={styles.infoValue}>{workOrder.deviceId?.deviceId || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📡 Device Type</Text>
          <Text style={styles.infoValue}>{workOrder.deviceId?.deviceType?.toUpperCase() || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔌 Status</Text>
          <View style={styles.deviceStatusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: workOrder.deviceId?.status === 'active' ? COLORS.success : COLORS.danger }
            ]} />
            <Text style={styles.infoValue}>{workOrder.deviceId?.status || 'Unknown'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🌐 Online Status</Text>
          <Text style={styles.infoValue}>
            {workOrder.deviceId?.isOnline ? 'Online ✅' : 'Offline ❌'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔋 Battery Status</Text>
          <Text style={styles.infoValue}>
            {workOrder.deviceId?.batteryStatus || 'Unknown'}
          </Text>
        </View>

        {workOrder.deviceId?.daysSinceLastSignal !== null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📶 Last Signal</Text>
            <Text style={styles.infoValue}>
              {workOrder.deviceId.daysSinceLastSignal === 0 
                ? 'Today' 
                : `${workOrder.deviceId.daysSinceLastSignal} days ago`}
            </Text>
          </View>
        )}
      </View>

      {/* Bin Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bin Location</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🗑️ Bin ID</Text>
          <Text style={styles.infoValue}>{workOrder.binId?.binId || 'N/A'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Address</Text>
          <Text style={styles.infoValue}>
            {workOrder.binId?.location?.address || 'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🗺️ Area</Text>
          <Text style={styles.infoValue}>
            {workOrder.binId?.location?.area || 'Not specified'}
          </Text>
        </View>

        {workOrder.binId?.location?.coordinates && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🌍 Coordinates</Text>
            <Text style={[styles.infoValue, styles.coordinates]}>
              {workOrder.binId.location.coordinates.lat}, {workOrder.binId.location.coordinates.lng}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📊 Fill Status</Text>
          <View style={styles.fillStatusContainer}>
            <View style={[
              styles.fillStatusIndicator,
              { backgroundColor: workOrder.binId?.fillStatusColor || 'gray' }
            ]} />
            <Text style={styles.infoValue}>
              {workOrder.binId?.fillStatusLabel || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Technician Information */}
      {workOrder.technicianId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Technician</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Name</Text>
            <Text style={styles.infoValue}>{workOrder.technicianId.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email</Text>
            <Text style={styles.infoValue}>{workOrder.technicianId.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Phone</Text>
            <Text style={styles.infoValue}>{workOrder.technicianId.phone}</Text>
          </View>
        </View>
      )}

      {/* Timeline Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Created</Text>
          <Text style={styles.infoValue}>{formatDate(workOrder.createdAt)}</Text>
        </View>
        
        {workOrder.assignedDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📋 Assigned</Text>
            <Text style={styles.infoValue}>{formatDate(workOrder.assignedDate)}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔄 Last Updated</Text>
          <Text style={styles.infoValue}>{formatDate(workOrder.updatedAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏱️ Days Open</Text>
          <Text style={styles.infoValue}>
            {workOrder.daysSinceCreated !== null && workOrder.daysSinceCreated !== undefined
              ? `${workOrder.daysSinceCreated} days`
              : 'N/A'}
          </Text>
        </View>

        {workOrder.resolutionTime !== null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⏰ Resolution Time</Text>
            <Text style={styles.infoValue}>
              {workOrder.resolutionTime ? `${workOrder.resolutionTime} hours` : 'Not completed'}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🆔 Work Order ID</Text>
          <Text style={[styles.infoValue, styles.workOrderIdText]}>{workOrder._id}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Text style={styles.actionsSectionTitle}>Actions</Text>
        
        {/* Pending status - check if assigned */}
        {workOrder.status === 'pending' && !workOrder.technicianId && (
          <Button
            title="👤 Assign to Me"
            onPress={handleAssignWorkOrder}
            style={styles.actionButton}
            disabled={updating}
          />
        )}

        {/* Start Work button - available for all work orders */}
        {workOrder.status !== 'in-progress' && workOrder.status !== 'completed' && (
          <Button
            title="🔧 Start Work"
            onPress={handleStartWorkOrder}
            style={styles.actionButton}
            disabled={updating}
          />
        )}

        {/* In-progress status */}
        {workOrder.status === 'in-progress' && (
          <>
            <Button
              title="✅ Mark as Completed"
              onPress={() => handleUpdateStatus('completed')}
              style={styles.actionButton}
              disabled={updating}
            />
            <Button
              title="⚠️ Escalate Issue"
              onPress={() => handleUpdateStatus('escalated')}
              style={[styles.actionButton, styles.escalateButton]}
              disabled={updating}
            />
          </>
        )}

        {/* Additional actions */}
        <Button
          title="📝 Add Notes"
          onPress={() => Alert.alert('Coming Soon', 'Add notes functionality will be implemented')}
          variant="outline"
          style={styles.actionButton}
          disabled={updating}
        />

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Work Orders</Text>
        </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.large,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.roleTechnician}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    borderWidth: 2,
    borderColor: COLORS.roleTechnician,
  },
  iconText: {
    fontSize: 40,
  },
  workOrderId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 16,
    borderWidth: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.medium,
    padding: SPACING.large,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  infoRow: {
    marginBottom: SPACING.medium,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  deviceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  fillStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fillStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  coordinates: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  workOrderIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: COLORS.textLight,
  },
  actionsSection: {
    padding: SPACING.large,
    paddingBottom: SPACING.large * 2,
  },
  actionsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  actionButton: {
    marginBottom: SPACING.medium,
  },
  escalateButton: {
    backgroundColor: COLORS.warning,
  },
  backButton: {
    marginTop: SPACING.medium,
    padding: SPACING.medium,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.roleTechnician,
    fontWeight: '600',
  },
});

export default WorkOrderDetailsScreen;

