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
    pending: { bg: '#FFF4E6', text: COLORS.citizenWarning, label: 'Pending' },
    approved: { bg: '#E3F2FD', text: COLORS.citizenInfo, label: 'Approved' },
    scheduled: { bg: '#E1F5FE', text: '#1976D2', label: 'Scheduled' },
    'in-progress': { bg: '#FFF3E0', text: '#F57C00', label: 'In Progress' },
    completed: { bg: COLORS.citizenBackground, text: COLORS.citizenPrimary, label: 'Completed' },
    cancelled: { bg: '#FFEBEE', text: COLORS.citizenDanger, label: 'Cancelled' },
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
    borderRadius: 16,
    padding: SPACING.medium + 2,
    marginBottom: SPACING.medium,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.citizenBorder,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenAccent,
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
    color: COLORS.citizenTextDark,
    textTransform: 'capitalize',
  },
  trackingId: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small + 2,
    paddingVertical: SPACING.small / 2 + 1,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: COLORS.citizenBorder,
    paddingTop: SPACING.small + 2,
    marginBottom: SPACING.small + 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small / 2 + 2,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.citizenTextGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.citizenTextDark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.citizenBorder,
    paddingTop: SPACING.small + 2,
  },
  createdDate: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
  },
  viewDetails: {
    fontSize: 14,
    color: COLORS.citizenAccent,
    fontWeight: '700',
  },
});

export default RequestCard;


