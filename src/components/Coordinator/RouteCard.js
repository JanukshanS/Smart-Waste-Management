import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const RouteCard = ({ route, onPress }) => {
  // Guard clause to ensure route exists
  if (!route) {
    return null;
  }

  // Debug logging to check route structure
  if (__DEV__) {
    console.log("RouteCard received route:", JSON.stringify(route, null, 2));
  }

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "#9E9E9E";
      case "assigned":
        return "#2196F3";
      case "in-progress":
        return "#FFA500";
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const statusColor = getStatusColor(route.status);
  const completionPercentage = Number(route.completionPercentage) || 0;

  // Ensure all required properties exist
  const safeRoute = {
    routeName: route.routeName || "Unnamed Route",
    status: route.status || "unknown",
    stops: route.stops || [],
    totalDistance: route.totalDistance || 0,
    estimatedDuration: route.estimatedDuration || 0,
    crewId: route.crewId || null,
    vehicleId: route.vehicleId || null,
    createdAt: route.createdAt || null,
    completionPercentage: completionPercentage,
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(route)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.routeName} numberOfLines={1}>
              {safeRoute.routeName}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>
                {safeRoute.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {safeRoute.stops.length > 0 && (
            <Text style={styles.stopsCount}>
              {`Stops: ${safeRoute.stops.length} locations`}
            </Text>
          )}

          <View style={styles.details}>
            {safeRoute.totalDistance > 0 && (
              <Text
                style={[styles.detailText, { marginRight: SPACING.medium }]}
              >
                {`🚗 ${Number(safeRoute.totalDistance).toFixed(1)} km`}
              </Text>
            )}
            {safeRoute.estimatedDuration > 0 && (
              <Text style={styles.detailText}>
                {`⏱️ ${Math.round(Number(safeRoute.estimatedDuration))} min`}
              </Text>
            )}
          </View>

          {safeRoute.crewId && (
            <Text style={styles.assignmentText}>
              {`Crew: ${
                typeof safeRoute.crewId === "object" && safeRoute.crewId.name
                  ? safeRoute.crewId.name
                  : safeRoute.crewId || "Unknown"
              }`}
            </Text>
          )}

          {safeRoute.vehicleId && (
            <Text style={styles.assignmentText}>
              {`Vehicle ID: ${
                typeof safeRoute.vehicleId === "object" &&
                safeRoute.vehicleId._id
                  ? safeRoute.vehicleId._id
                  : safeRoute.vehicleId || "Unknown"
              }`}
            </Text>
          )}

          {/* Progress Bar for active routes */}
          {(safeRoute.status === "in-progress" ||
            safeRoute.status === "assigned") && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                {`Progress: ${completionPercentage}%`}
              </Text>
              <ProgressBar
                progress={completionPercentage / 100}
                color={COLORS.primary}
                style={styles.progressBar}
              />
            </View>
          )}

          {safeRoute.createdAt && (
            <Text style={styles.dateText}>
              {`Created: ${(() => {
                try {
                  return new Date(safeRoute.createdAt).toLocaleDateString();
                } catch (error) {
                  return "Invalid Date";
                }
              })()}`}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: COLORS.white,
  },
  stopsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  details: {
    flexDirection: "row",
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
    fontWeight: "600",
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

