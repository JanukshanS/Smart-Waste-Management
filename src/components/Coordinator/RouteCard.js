import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const RouteCard = ({ route, onPress }) => {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return '#9E9E9E';
      case 'assigned':
        return '#2196F3';
      case 'in-progress':
        return '#FFA500';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const statusColor = getStatusColor(route.status);
  const completionPercentage = route.completionPercentage || 0;

  return (
    <TouchableOpacity onPress={() => onPress?.(route)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.routeName} numberOfLines={1}>
              {route.routeName}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{route.status?.toUpperCase()}</Text>
            </View>
          </View>

          {route.stops && route.stops.length > 0 && (
            <Text style={styles.stopsCount}>
              Stops: {route.stops.length} locations
            </Text>
          )}

          <View style={styles.details}>
            {route.totalDistance && (
              <Text style={styles.detailText}>
                🚗 {route.totalDistance.toFixed(1)} km
              </Text>
            )}
            {route.estimatedDuration && (
              <Text style={styles.detailText}>
                ⏱️ {Math.round(route.estimatedDuration)} min
              </Text>
            )}
          </View>

          {route.crewId && (
            <Text style={styles.assignmentText}>
              Crew ID: {route.crewId}
            </Text>
          )}

          {route.vehicleId && (
            <Text style={styles.assignmentText}>
              Vehicle ID: {route.vehicleId}
            </Text>
          )}

          {/* Progress Bar for active routes */}
          {(route.status === 'in-progress' || route.status === 'assigned') && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                Progress: {completionPercentage}%
              </Text>
              <ProgressBar 
                progress={completionPercentage / 100} 
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          )}

          {route.createdAt && (
            <Text style={styles.dateText}>
              Created: {new Date(route.createdAt).toLocaleDateString()}
            </Text>
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
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.small,
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
  stopsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  details: {
    flexDirection: 'row',
    gap: SPACING.medium,
    marginBottom: SPACING.small,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  assignmentText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  progressContainer: {
    marginTop: SPACING.small,
    marginBottom: SPACING.small,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
});

export default RouteCard;

