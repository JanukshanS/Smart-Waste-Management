import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinDeviceCard = ({ bin }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "#4CAF50";
      case "offline":
        return "#757575";
      case "low_battery":
        return "#FFA500";
      case "error":
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  if (!bin.deviceId) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Device Information</Text>
          <Text style={styles.noDeviceText}>No device connected</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Device Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device ID:</Text>
          <Text style={styles.infoValue}>
            {bin.deviceId.deviceId || "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getDeviceStatusColor(bin.deviceId.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {bin.deviceId.status || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
        {bin.deviceId.batteryLevel !== undefined && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Battery Level:</Text>
            <Text style={styles.infoValue}>
              {bin.deviceId.batteryLevel}%
            </Text>
          </View>
        )}
        {bin.deviceId.lastPing && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Ping:</Text>
            <Text style={styles.infoValue}>
              {formatDate(bin.deviceId.lastPing)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 2,
    textAlign: "right",
  },
  noDeviceText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: SPACING.medium,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small / 2,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default BinDeviceCard;
