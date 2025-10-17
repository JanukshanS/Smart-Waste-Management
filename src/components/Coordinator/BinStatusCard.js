import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinStatusCard = ({ bin, onPress, showActions = true }) => {
  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 90) return COLORS.error;
    if (fillLevel >= 70) return '#FFA500';
    return '#4CAF50';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'offline':
        return '#9E9E9E';
      case 'maintenance':
        return '#FFA500';
      case 'full':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const getPriorityLevel = (fillLevel) => {
    if (fillLevel >= 90) return 'HIGH';
    if (fillLevel >= 70) return 'MEDIUM';
    return 'LOW';
  };

  const getPriorityColor = (fillLevel) => {
    if (fillLevel >= 90) return COLORS.error;
    if (fillLevel >= 70) return '#FFA500';
    return '#4CAF50';
  };

  const formatLastCollection = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const fillLevelColor = getFillLevelColor(bin.fillLevel || 0);
  const statusColor = getStatusColor(bin.status);
  const priorityLevel = getPriorityLevel(bin.fillLevel || 0);
  const priorityColor = getPriorityColor(bin.fillLevel || 0);

  return (
    <TouchableOpacity 
      onPress={() => onPress?.(bin)} 
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Card style={[styles.card, bin.fillLevel >= 90 && styles.urgentCard]}>
        <Card.Content>
          {/* Header with Bin ID and Status */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.binId}>{bin.binId || 'Unknown ID'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{bin.status?.toUpperCase() || 'UNKNOWN'}</Text>
              </View>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {priorityLevel}
              </Text>
            </View>
          </View>

          {/* Location Information */}
          <View style={styles.locationContainer}>
            <Text style={styles.location} numberOfLines={1}>
              📍 {bin.location?.address || 'Unknown Location'}
            </Text>
            {bin.location?.area && (
              <Text style={styles.area}>{bin.location.area}</Text>
            )}
          </View>

          {/* Fill Level Section */}
          <View style={styles.fillLevelSection}>
            <View style={styles.fillLevelHeader}>
              <Text style={styles.fillLevelLabel}>Fill Level</Text>
              <Text style={[styles.fillLevelValue, { color: fillLevelColor }]}>
                {bin.fillLevel || 0}%
              </Text>
            </View>
            <ProgressBar 
              progress={(bin.fillLevel || 0) / 100} 
              color={fillLevelColor}
              style={styles.progressBar}
            />
            <Text style={styles.fillLevelDescription}>
              {bin.fillLevel >= 90 ? '🚨 Needs immediate collection' :
               bin.fillLevel >= 70 ? '⚠️ Collection needed soon' :
               '✅ Normal level'}
            </Text>
          </View>

          {/* Bin Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{bin.binType || 'General'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Capacity:</Text>
              <Text style={styles.detailValue}>{bin.capacity || 'N/A'}L</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Collection:</Text>
              <Text style={styles.detailValue}>
                {formatLastCollection(bin.lastCollection)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {showActions && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => onPress?.(bin)}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              {bin.fillLevel >= 70 && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.scheduleButton]}
                  onPress={() => {/* Handle schedule collection */}}
                >
                  <Text style={[styles.actionButtonText, { color: COLORS.white }]}>
                    Schedule Collection
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
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
    gap: SPACING.small,
  },
  binId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationContainer: {
    marginBottom: SPACING.medium,
  },
  location: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  area: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  fillLevelSection: {
    marginBottom: SPACING.medium,
  },
  fillLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  fillLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  fillLevelValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.small,
  },
  fillLevelDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  detailsSection: {
    marginBottom: SPACING.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: COLORS.primary + '15',
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default BinStatusCard;
