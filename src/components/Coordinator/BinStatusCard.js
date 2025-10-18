import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Menu, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../constants/theme";

const BinStatusCard = ({
  bin,
  statusMenuVisible,
  updatingStatus,
  onStatusMenuToggle,
  onStatusUpdate,
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#4CAF50";
      case "offline":
        return "#757575";
      case "maintenance":
        return "#FFA500";
      case "full":
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const statusOptions = [
    { label: "Active", value: "active", icon: "check-circle" },
    { label: "Offline", value: "offline", icon: "close-circle" },
    { label: "Maintenance", value: "maintenance", icon: "wrench" },
    { label: "Full", value: "full", icon: "package-variant" },
  ];

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardTitleContainer}>
          <MaterialCommunityIcons
            name="delete"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.cardTitle}>
            {bin.binId || bin._id || "Unknown Bin"}
          </Text>
        </View>
        <View style={styles.statusSection}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(bin.status) },
              ]}
            >
              <Text style={styles.statusText}>{bin.status || "Unknown"}</Text>
            </View>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => onStatusMenuToggle(false)}
              anchor={
                <TouchableOpacity
                  style={[
                    styles.statusUpdateButton,
                    updatingStatus && styles.statusUpdateButtonDisabled,
                  ]}
                  onPress={() => onStatusMenuToggle(true)}
                  disabled={updatingStatus}
                >
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons
                      name={updatingStatus ? "loading" : "cog"}
                      size={16}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text
                      style={[
                        styles.statusUpdateButtonText,
                        updatingStatus && styles.statusUpdateButtonTextDisabled,
                      ]}
                    >
                      {updatingStatus ? "Updating..." : "Change Status"}
                    </Text>
                  </View>
                </TouchableOpacity>
              }
            >
              {statusOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => onStatusUpdate(option.value)}
                  title={
                    <View style={styles.menuItemContent}>
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={18}
                        color={
                          option.value === bin.status
                            ? COLORS.textLight
                            : COLORS.text
                        }
                        style={styles.menuItemIcon}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          option.value === bin.status &&
                            styles.menuItemTextDisabled,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                  }
                  disabled={option.value === bin.status}
                />
              ))}
            </Menu>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bin Type:</Text>
          <Text style={styles.infoValue}>{bin.binType || "Standard"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Capacity:</Text>
          <Text style={styles.infoValue}>{bin.capacity || "N/A"} L</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fill Level:</Text>
          <Text
            style={[
              styles.infoValue,
              {
                color:
                  bin.fillLevel >= 90
                    ? COLORS.error
                    : bin.fillLevel >= 70
                    ? "#FFA500"
                    : "#4CAF50",
              },
            ]}
          >
            {bin.fillLevel || 0}%
          </Text>
        </View>
        {bin.location?.address && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {bin.location.address}
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
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
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
  statusSection: {
    marginBottom: SPACING.medium,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.small,
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusUpdateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusUpdateButtonDisabled: {
    backgroundColor: COLORS.textLight,
    borderColor: COLORS.textLight,
  },
  statusUpdateButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  statusUpdateButtonTextDisabled: {
    color: COLORS.white,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: SPACING.small / 2,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    marginRight: SPACING.small,
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.text,
  },
  menuItemTextDisabled: {
    color: COLORS.textLight,
  },
});

export default BinStatusCard;