import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
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
  
  // Resolution form state
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  
  // Diagnose fault modal state
  const [showDiagnoseModal, setShowDiagnoseModal] = useState(false);
  
  // Escalate modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

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

  const handleMarkAsCompleted = () => {
    setShowResolutionModal(true);
  };

  const handleDiagnoseFault = () => {
    setShowDiagnoseModal(true);
  };

  const handleSignalTest = () => {
    setShowDiagnoseModal(false);
    Alert.alert('Signal Test', 'Signal sent successfully to the Bin');
  };

  const handlePowerTest = () => {
    setShowDiagnoseModal(false);
    Alert.alert('Power Test', 'Power test completed successfully');
  };

  const handleEscalateIssue = () => {
    setShowEscalateModal(true);
  };

  const handleEscalateWorkOrder = async () => {
    // Validate escalation reason
    if (!escalateReason.trim()) {
      Alert.alert('Required', 'Please enter escalation reason');
      return;
    }

    try {
      setUpdating(true);
      setShowEscalateModal(false);

      const response = await technicianApi.escalateWorkOrder(id, escalateReason.trim());
      
      if (response.success) {
        Alert.alert('Success', 'Work order escalated successfully');
        setEscalateReason('');
        fetchWorkOrderDetails(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to escalate work order');
      }
    } catch (error) {
      console.error('Escalate work order error:', error);
      Alert.alert('Error', 'Failed to escalate work order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveWorkOrder = async () => {
    // Validate resolution notes
    if (!resolutionNotes.trim()) {
      Alert.alert('Required', 'Please enter resolution notes');
      return;
    }

    try {
      setUpdating(true);
      setShowResolutionModal(false);

      const resolutionData = {
        actionTaken: 'repaired',
        resolutionNotes: resolutionNotes.trim(),
      };

      // Add new device ID only if provided
      if (newDeviceId.trim()) {
        resolutionData.newDeviceId = newDeviceId.trim();
      }

      const response = await technicianApi.resolveWorkOrder(id, resolutionData);
      
      if (response.success) {
        Alert.alert('Success', 'Work order completed successfully');
        setResolutionNotes('');
        setNewDeviceId('');
        fetchWorkOrderDetails(); // Refresh data
      } else {
        Alert.alert('Error', response.message || 'Failed to resolve work order');
      }
    } catch (error) {
      console.error('Resolve work order error:', error);
      Alert.alert('Error', 'Failed to resolve work order. Please try again.');
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

  // Override status if work order is repaired
  const displayStatusConfig = workOrder.actionTaken === 'repaired' 
    ? { bg: COLORS.successBg, text: COLORS.successText, label: 'Resolved', icon: '✅' }
    : statusConfig;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconLarge}>
          <Text style={styles.iconText}>{issueIcon}</Text>
        </View>
        <Text style={styles.workOrderId}>#{workOrder.workOrderId}</Text>
        
        <View style={styles.badgesContainer}>
          <View style={[styles.statusBadge, { backgroundColor: displayStatusConfig.bg, borderColor: displayStatusConfig.text }]}>
            <Text style={styles.badgeIcon}>{displayStatusConfig.icon}</Text>
            <Text style={[styles.badgeText, { color: displayStatusConfig.text }]}>
              {displayStatusConfig.label}
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
        
        {/* Hide action buttons if work order is already repaired */}
        {workOrder.actionTaken !== 'repaired' && (
          <>
            {/* Pending status - check if assigned */}
            {workOrder.status === 'pending' && !workOrder.technicianId && (
              <Button
                title="👤 Assign to Me"
                onPress={handleAssignWorkOrder}
                style={styles.actionButton}
                disabled={updating}
              />
            )}

            {/* Start Work button - available for assigned work orders */}
            {workOrder.status !== 'in-progress' && workOrder.status !== 'completed' && (
              <Button
                title={
                  workOrder.status === 'pending' && !workOrder.technicianId 
                    ? "Start Work (Assign First)" 
                    : "Start Work"
                }
                onPress={handleStartWorkOrder}
                style={[
                  styles.actionButton,
                  (workOrder.status === 'pending' && !workOrder.technicianId) && styles.disabledButton
                ]}
                disabled={updating || (workOrder.status === 'pending' && !workOrder.technicianId)}
              />
            )}

            {/* In-progress status */}
            {workOrder.status === 'in-progress' && (
              <>
                <Button
                  title="✅ Mark as Completed"
                  onPress={handleMarkAsCompleted}
                  style={styles.actionButton}
                  disabled={updating}
                />
                <Button
                  title="⚠️ Escalate Issue"
                  onPress={handleEscalateIssue}
                  style={[styles.actionButton, styles.escalateButton]}
                  disabled={updating}
                />
              </>
            )}

            {/* Additional actions */}
            <Button
              title="Diagnose Fault"
              onPress={handleDiagnoseFault}
              variant="outline"
              style={styles.actionButton}
              disabled={updating}
            />
          </>
        )}

        {/* Show completion message if repaired */}
        {workOrder.actionTaken === 'repaired' && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedIcon}>✅</Text>
            <Text style={styles.completedTitle}>Work Order Completed</Text>
            <Text style={styles.completedMessage}>
              This work order has been successfully resolved and marked as repaired.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Work Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Resolution Modal */}
      <Modal
        visible={showResolutionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResolutionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Work Order</Text>
              <TouchableOpacity 
                onPress={() => setShowResolutionModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Action Taken: <Text style={styles.actionTakenText}>Repaired</Text>
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Resolution Notes <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe the work done and resolution details..."
                  placeholderTextColor={COLORS.textLight}
                  value={resolutionNotes}
                  onChangeText={setResolutionNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Device ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new device ID if replaced"
                  placeholderTextColor={COLORS.textLight}
                  value={newDeviceId}
                  onChangeText={setNewDeviceId}
                />
                <Text style={styles.inputHint}>
                  Only fill this if you replaced the device
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowResolutionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleResolveWorkOrder}
              >
                <Text style={styles.submitButtonText}>✅ Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Diagnose Fault Modal */}
      <Modal
        visible={showDiagnoseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDiagnoseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Diagnose Fault</Text>
              <TouchableOpacity 
                onPress={() => setShowDiagnoseModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Select a diagnostic test to run on the device:
              </Text>

              <View style={styles.testButtonsContainer}>
                <TouchableOpacity
                  style={[styles.testButton, styles.signalTestButton]}
                  onPress={handleSignalTest}
                >
                  <Text style={styles.testButtonIcon}></Text>
                  <Text style={styles.testButtonTitle}>Signal Test</Text>
                  <Text style={styles.testButtonDescription}>
                    Test device connectivity and signal strength
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.testButton, styles.powerTestButton]}
                  onPress={handlePowerTest}
                >
                  <Text style={styles.testButtonIcon}></Text>
                  <Text style={styles.testButtonTitle}>Power Test</Text>
                  <Text style={styles.testButtonDescription}>
                    Test battery level and power consumption
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDiagnoseModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Escalate Issue Modal */}
      <Modal
        visible={showEscalateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEscalateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚠️ Escalate Issue</Text>
              <TouchableOpacity 
                onPress={() => setShowEscalateModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Please provide a reason for escalating this work order:
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Escalation Reason <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe why this work order needs to be escalated..."
                  placeholderTextColor={COLORS.textLight}
                  value={escalateReason}
                  onChangeText={setEscalateReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEscalateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.escalateSubmitButton]}
                onPress={handleEscalateWorkOrder}
              >
                <Text style={styles.escalateSubmitButtonText}>⚠️ Escalate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 80,
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
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    borderWidth: 2,
    borderColor: COLORS.primary,
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
  disabledButton: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  backButton: {
    marginTop: SPACING.medium,
    padding: SPACING.medium,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  completedContainer: {
    backgroundColor: COLORS.successBg,
    borderRadius: 12,
    padding: SPACING.large,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
    marginBottom: SPACING.medium,
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: SPACING.small,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.successText,
    marginBottom: SPACING.small,
  },
  completedMessage: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  modalBody: {
    padding: SPACING.large,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  actionTakenText: {
    fontWeight: 'bold',
    color: COLORS.success,
  },
  inputGroup: {
    marginBottom: SPACING.large,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small / 2,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.medium,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.success,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Diagnose fault modal styles
  testButtonsContainer: {
    gap: SPACING.medium,
  },
  testButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.large,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signalTestButton: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  powerTestButton: {
    borderColor: '#F57C00',
    backgroundColor: '#FFF3E0',
  },
  testButtonIcon: {
    fontSize: 1,
  },
  testButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small / 2,
  },
  testButtonDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Escalate modal styles
  escalateSubmitButton: {
    backgroundColor: COLORS.warning,
  },
  escalateSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default WorkOrderDetailsScreen;

