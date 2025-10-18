import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, MapPin, AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';

const BinCard = ({ bin, onPress }) => {
  const getBinTypeConfig = (binType) => {
    switch (binType) {
      case 'general':
        return { color: COLORS.gray, label: 'General', icon: Trash2 };
      case 'recyclable':
        return { color: COLORS.info, label: 'Recyclable', icon: Trash2 };
      case 'organic':
        return { color: COLORS.success, label: 'Organic', icon: Trash2 };
      case 'hazardous':
        return { color: COLORS.danger, label: 'Hazardous', icon: Trash2 };
      default:
        return { color: COLORS.gray, label: binType, icon: Trash2 };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: COLORS.success, label: 'Active', icon: CheckCircle };
      case 'full':
        return { color: COLORS.danger, label: 'Full', icon: AlertCircle };
      case 'maintenance':
        return { color: COLORS.warning, label: 'Maintenance', icon: Wrench };
      case 'inactive':
        return { color: COLORS.gray, label: 'Inactive', icon: Clock };
      default:
        return { color: COLORS.gray, label: status, icon: AlertCircle };
    }
  };

  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 80) return COLORS.danger;
    if (fillLevel >= 60) return COLORS.warning;
    return COLORS.success;
  };

  const binTypeConfig = getBinTypeConfig(bin.binType);
  const statusConfig = getStatusConfig(bin.status);
  const fillLevelColor = getFillLevelColor(bin.fillLevel);
  const BinIcon = binTypeConfig.icon;
  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${binTypeConfig.color}15` }]}>
            <BinIcon size={24} color={binTypeConfig.color} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.binId}>{bin.binId}</Text>
            <View style={styles.typeContainer}>
              <Text style={[styles.binType, { color: binTypeConfig.color }]}>
                {binTypeConfig.label}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15`, borderColor: statusConfig.color }]}>
          <StatusIcon size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Fill Level Progress */}
      <View style={styles.fillLevelSection}>
        <View style={styles.fillLevelHeader}>
          <Text style={styles.fillLevelLabel}>Fill Level</Text>
          <Text style={[styles.fillLevelValue, { color: fillLevelColor }]}>
            {bin.fillLevel}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${bin.fillLevel}%`,
                backgroundColor: fillLevelColor,
              },
            ]}
          />
        </View>
        <Text style={styles.capacityText}>
          {Math.round((bin.fillLevel / 100) * bin.capacity)}L / {bin.capacity}L
        </Text>
      </View>

      {/* Location Info */}
      <View style={styles.locationSection}>
        <MapPin size={14} color={COLORS.textLight} style={styles.locationIcon} />
        <View style={styles.locationInfo}>
          <Text style={styles.locationAddress}>{bin.location.address}</Text>
          <Text style={styles.locationArea}>{bin.location.area}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Collections</Text>
          <Text style={styles.statValue}>{bin.collectionCount || 0}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Last Updated</Text>
          <Text style={styles.statValue}>
            {new Date(bin.lastUpdated).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        {bin.lastEmptied && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Last Emptied</Text>
              <Text style={styles.statValue}>
                {new Date(bin.lastEmptied).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Urgent Badge */}
      {bin.isUrgent && (
        <View style={styles.urgentBadge}>
          <AlertCircle size={16} color={COLORS.white} />
          <Text style={styles.urgentText}>Urgent Collection Needed</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  headerInfo: {
    flex: 1,
  },
  binId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  binType: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fillLevelSection: {
    marginBottom: SPACING.medium,
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  fillLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  fillLevelLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  fillLevelValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityText: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationArea: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    paddingTop: SPACING.small,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.small,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
    marginTop: SPACING.medium,
    gap: 6,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default BinCard;
