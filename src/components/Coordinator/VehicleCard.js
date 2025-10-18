import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const VehicleCard = ({ vehicle, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'in-use':
        return '#2196F3';
      case 'maintenance':
        return '#FFA500';
      case 'decommissioned':
        return '#9E9E9E';
      default:
        return COLORS.textLight;
    }
  };

  const getVehicleTypeIcon = (type) => {
    switch (type) {
      case 'truck':
        return '🚚';
      case 'van':
        return '🚐';
      case 'compactor':
        return '🗑️';
      case 'pickup':
        return '🛻';
      default:
        return '🚗';
    }
  };

  const formatVehicleType = (type) => {
    if (!type) return 'Unknown';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const statusColor = getStatusColor(vehicle.status);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>{getVehicleTypeIcon(vehicle.vehicleType)}</Text>
              <View style={styles.titleContainer}>
                <Text style={styles.vehicleId}>{vehicle.vehicleId}</Text>
                <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
              </View>
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={styles.statusText}
            >
              {vehicle.status?.toUpperCase()}
            </Chip>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {formatVehicleType(vehicle.vehicleType)}
              </Text>
            </View>

            {vehicle.capacity && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Capacity:</Text>
                <Text style={styles.detailValue}>
                  {vehicle.capacity} m³
                </Text>
              </View>
            )}

            {vehicle.manufacturer && vehicle.model && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Model:</Text>
                <Text style={styles.detailValue}>
                  {vehicle.manufacturer} {vehicle.model}
                </Text>
              </View>
            )}

            {vehicle.year && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detailValue}>{vehicle.year}</Text>
              </View>
            )}
          </View>

          {vehicle.assignedCrewId && (
            <View style={styles.assignmentSection}>
              <Text style={styles.assignmentLabel}>Assigned to:</Text>
              <Text style={styles.assignmentValue}>
                {typeof vehicle.assignedCrewId === 'object'
                  ? vehicle.assignedCrewId.name
                  : vehicle.assignedCrewId}
              </Text>
            </View>
          )}

          {vehicle.currentRouteId && (
            <View style={styles.routeSection}>
              <Text style={styles.routeLabel}>Current Route:</Text>
              <Text style={styles.routeValue}>
                {typeof vehicle.currentRouteId === 'object'
                  ? vehicle.currentRouteId.routeName
                  : vehicle.currentRouteId}
              </Text>
            </View>
          )}

          {vehicle.maintenanceDue && vehicle.daysUntilMaintenance !== null && (
            <View style={styles.warningSection}>
              <Text style={styles.warningText}>
                ⚠️ Maintenance {vehicle.daysUntilMaintenance > 0
                  ? `due in ${vehicle.daysUntilMaintenance} days`
                  : 'overdue'}
              </Text>
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
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.small,
  },
  titleContainer: {
    flex: 1,
  },
  vehicleId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  licensePlate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  details: {
    marginTop: SPACING.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  assignmentSection: {
    marginTop: SPACING.medium,
    padding: SPACING.small,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
  },
  assignmentLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  assignmentValue: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  routeSection: {
    marginTop: SPACING.small,
    padding: SPACING.small,
    backgroundColor: '#F3E5F5',
    borderRadius: 4,
  },
  routeLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 14,
    color: '#7B1FA2',
    fontWeight: '600',
  },
  warningSection: {
    marginTop: SPACING.small,
    padding: SPACING.small,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
});

export default VehicleCard;

