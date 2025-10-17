import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const WorkOrderCard = ({ workOrder, onPress }) => {
  // Status configuration
  const statusColors = {
    pending: { bg: COLORS.warningBg, text: COLORS.warningText, label: 'Pending' },
    'in-progress': { bg: '#E3F2FD', text: '#1976D2', label: 'In Progress' },
    completed: { bg: COLORS.successBg, text: COLORS.successText, label: 'Completed' },
    escalated: { bg: COLORS.dangerBg, text: COLORS.dangerText, label: 'Escalated' },
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

  let statusConfig = statusColors[workOrder.status] || statusColors.pending;
  
  // Override status to "Resolved" if action taken is "repaired"
  if (workOrder.actionTaken === 'repaired') {
    statusConfig = {
      bg: COLORS.successBg,
      text: COLORS.successText,
      label: 'Resolved',
      icon: '✅'
    };
  }
  
  const priorityConfig = priorityColors[workOrder.priority] || priorityColors.medium;
  const issueIcon = issueTypeIcons[workOrder.issueType] || '🛠️';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatIssueType = (type) => {
    return type?.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'N/A';
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress && onPress(workOrder)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{issueIcon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.workOrderId}>#{workOrder.workOrderId}</Text>
            <Text style={styles.deviceId}>{workOrder.deviceId?.deviceId || 'N/A'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Issue Details */}
      <View style={styles.issueSection}>
        <Text style={styles.issueType}>{formatIssueType(workOrder.issueType)}</Text>
        <Text style={styles.issueDescription} numberOfLines={2}>
          {workOrder.issueDescription}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Priority:</Text>
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityIcon}>{priorityConfig.icon}</Text>
            <Text style={[styles.priorityText, { color: priorityConfig.text }]}>
              {workOrder.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 Location:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {workOrder.binId?.location?.address || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Created:</Text>
          <Text style={styles.detailValue}>{formatDate(workOrder.createdAt)}</Text>
        </View>

        {workOrder.assignedDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📋 Assigned:</Text>
            <Text style={styles.detailValue}>{formatDate(workOrder.assignedDate)}</Text>
          </View>
        )}

        {workOrder.daysSinceCreated !== null && workOrder.daysSinceCreated !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Days Open:</Text>
            <Text style={styles.detailValue}>{workOrder.daysSinceCreated} days</Text>
          </View>
        )}

        {/* Action Taken */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>⚙️ Action:</Text>
          <View style={[
            styles.actionBadge,
            { backgroundColor: workOrder.actionTaken === 'none' ? '#FFF3E0' : '#E8F5E9' }
          ]}>
            <Text style={[
              styles.actionBadgeText,
              { color: workOrder.actionTaken === 'none' ? '#F57C00' : '#388E3C' }
            ]}>
              {workOrder.actionTaken === 'none' ? 'Pending' : workOrder.actionTaken.charAt(0).toUpperCase() + workOrder.actionTaken.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.roleTechnician,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.small,
  },
  headerText: {
    flex: 1,
  },
  workOrderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deviceId: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.small / 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  issueSection: {
    marginBottom: SPACING.medium,
    paddingBottom: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  issueType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  details: {
    marginBottom: SPACING.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small / 2,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.small,
  },
  viewDetails: {
    fontSize: 14,
    color: COLORS.roleTechnician,
    fontWeight: '600',
  },
  actionBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WorkOrderCard;

