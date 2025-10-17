import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinCard = ({ bin, onPress }) => {
  // Determine fill level color
  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 90) return COLORS.error;
    if (fillLevel >= 70) return '#FFA500'; // Orange
    return '#4CAF50'; // Green
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
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

  const fillLevelColor = getFillLevelColor(bin.fillLevel);
  const statusColor = getStatusColor(bin.status);

  return (
    <TouchableOpacity onPress={() => onPress?.(bin)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.binId}>{bin.binId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{bin.status?.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.location} numberOfLines={2}>
            {bin.location?.address || 'Unknown Location'}
          </Text>

          {bin.location?.area && (
            <Text style={styles.area}>{bin.location.area}</Text>
          )}

          {/* Fill Level Bar */}
          <View style={styles.fillLevelContainer}>
            <Text style={styles.fillLevelLabel}>Fill Level: {bin.fillLevel}%</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${bin.fillLevel}%`, backgroundColor: fillLevelColor }
                ]} 
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.detailText}>
              Type: {bin.binType || 'general'}
            </Text>
            <Text style={styles.detailText}>
              Capacity: {bin.capacity}L
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  binId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  location: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  area: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.small,
  },
  fillLevelContainer: {
    marginTop: SPACING.small,
    marginBottom: SPACING.small,
  },
  fillLevelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.small,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default BinCard;

