import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const RequestCard = ({ request, onPress }) => {
  const wasteTypeIcons = {
    household: '🏠',
    recyclable: '♻️',
    organic: '🌱',
    electronic: '📱',
    hazardous: '⚠️',
  };

  const statusColors = {
    pending: { bg: COLORS.warningBg, text: COLORS.warningText, label: 'Pending' },
    approved: { bg: COLORS.infoBg, text: COLORS.info, label: 'Approved' },
    scheduled: { bg: '#E3F2FD', text: '#1976D2', label: 'Scheduled' },
    'in-progress': { bg: '#FFF3E0', text: '#F57C00', label: 'In Progress' },
    completed: { bg: '#E8F5E9', text: '#388E3C', label: 'Completed' },
    cancelled: { bg: COLORS.dangerBg, text: COLORS.dangerText, label: 'Cancelled' },
  };

  const statusConfig = statusColors[request.status] || statusColors.pending;
  const icon = wasteTypeIcons[request.wasteType] || '📦';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress && onPress(request)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.wasteType}>{request.wasteType}</Text>
            <Text style={styles.trackingId}>#{request.trackingId}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📦 Quantity:</Text>
          <Text style={styles.detailValue}>{request.quantity}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📍 Location:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {request.address.street}, {request.address.city}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Preferred Date:</Text>
          <Text style={styles.detailValue}>{formatDate(request.preferredDate)}</Text>
        </View>

        {request.estimatedCost > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Estimated Cost:</Text>
            <Text style={styles.detailValue}>Rs. {request.estimatedCost.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.createdDate}>
          Created: {formatDate(request.createdAt)}
        </Text>
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
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
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
  wasteType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  trackingId: {
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
  details: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.small,
    marginBottom: SPACING.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.small,
  },
  createdDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  viewDetails: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RequestCard;

