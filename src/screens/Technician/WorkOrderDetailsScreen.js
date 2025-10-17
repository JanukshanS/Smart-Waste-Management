import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "react-native-paper";
import { COLORS, SPACING } from "../../constants/theme";
import { technicianApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const WorkOrderDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workOrder, setWorkOrder] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWorkOrderDetails();
  }, [id]);

  const fetchWorkOrderDetails = async () => {
    try {
      const response = await technicianApi.getWorkOrderDetails(id);
      if (response.success) {
        setWorkOrder(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching work order details:", err);
      setError("Failed to load work order details");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    Alert.alert("Assign Work Order", "Assign this work order to yourself?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Assign",
        onPress: async () => {
          try {
            setActionLoading(true);
            const response = await technicianApi.assignWorkOrder(id, user._id);
            if (response.success) {
              Alert.alert("Success", "Work order assigned successfully");
              fetchWorkOrderDetails();
            }
          } catch (err) {
            Alert.alert("Error", err.message || "Failed to assign work order");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleStart = async () => {
    Alert.alert("Start Work Order", "Mark this work order as in progress?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Start",
        onPress: async () => {
          try {
            setActionLoading(true);
            const response = await technicianApi.startWorkOrder(id);
            if (response.success) {
              Alert.alert("Success", "Work order started");
              fetchWorkOrderDetails();
            }
          } catch (err) {
            Alert.alert("Error", err.message || "Failed to start work order");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleResolve = () => {
    router.push(`/technician/resolve-work-order?id=${id}`);
  };

  const handleEscalate = () => {
    Alert.prompt(
      "Escalate Work Order",
      "Please provide a reason for escalation:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Escalate",
          onPress: async (reason) => {
            if (!reason || !reason.trim()) {
              Alert.alert("Error", "Reason is required");
              return;
            }
            try {
              setActionLoading(true);
              const response = await technicianApi.escalateWorkOrder(
                id,
                reason
              );
              if (response.success) {
                Alert.alert("Success", "Work order escalated");
                fetchWorkOrderDetails();
              }
            } catch (err) {
              Alert.alert(
                "Error",
                err.message || "Failed to escalate work order"
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (error || !workOrder) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Work order not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchWorkOrderDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#FFC107";
      case "low":
        return "#4CAF50";
      default:
        return COLORS.textLight;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "assigned":
        return "#2196F3";
      case "in-progress":
        return COLORS.primary;
      case "resolved":
        return "#4CAF50";
      case "escalated":
        return "#F44336";
      default:
        return COLORS.textLight;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Work Order Details</Text>
          </View>
          <View style={styles.badgesContainer}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(workOrder.priority) },
              ]}
            >
              <Text style={styles.badgeText}>{workOrder.priority}</Text>
            </View>
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <View
            style={[
              styles.statusCard,
              { backgroundColor: getStatusColor(workOrder.status) + "15" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(workOrder.status) },
              ]}
            >
              Status: {workOrder.status}
            </Text>
          </View>
        </View>

        {/* Issue Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Issue Description</Text>
            <Text style={styles.issueText}>
              {workOrder.issueDescription || "No description provided"}
            </Text>
          </Card.Content>
        </Card>

        {/* Device & Bin Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Device & Bin Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Device ID:</Text>
              <Text style={styles.infoValue}>
                {workOrder.deviceId || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🗑️ Bin ID:</Text>
              <Text style={styles.infoValue}>{workOrder.binId || "N/A"}</Text>
            </View>
            {workOrder.deviceType && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{workOrder.deviceType}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Timestamps */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Timeline</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>
                {new Date(workOrder.createdAt).toLocaleString()}
              </Text>
            </View>
            {workOrder.assignedDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Assigned:</Text>
                <Text style={styles.infoValue}>
                  {new Date(workOrder.assignedDate).toLocaleString()}
                </Text>
              </View>
            )}
            {workOrder.startedDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Started:</Text>
                <Text style={styles.infoValue}>
                  {new Date(workOrder.startedDate).toLocaleString()}
                </Text>
              </View>
            )}
            {workOrder.resolvedDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Resolved:</Text>
                <Text style={styles.infoValue}>
                  {new Date(workOrder.resolvedDate).toLocaleString()}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Resolution Details (if resolved) */}
        {workOrder.status === "resolved" && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Resolution Details</Text>
              {workOrder.actionTaken && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Action:</Text>
                  <Text style={styles.infoValue}>{workOrder.actionTaken}</Text>
                </View>
              )}
              {workOrder.resolutionNotes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Notes:</Text>
                  <Text style={styles.infoValue}>
                    {workOrder.resolutionNotes}
                  </Text>
                </View>
              )}
              {workOrder.newDeviceId && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>New Device:</Text>
                  <Text style={styles.infoValue}>{workOrder.newDeviceId}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        {workOrder.status !== "resolved" &&
          workOrder.status !== "cancelled" && (
            <View style={styles.actionsSection}>
              {workOrder.status === "pending" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.assignButton]}
                  onPress={handleAssign}
                  disabled={actionLoading}
                >
                  <Text style={styles.actionButtonText}>Assign to Me</Text>
                </TouchableOpacity>
              )}

              {workOrder.status === "assigned" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={handleStart}
                  disabled={actionLoading}
                >
                  <Text style={styles.actionButtonText}>Start Work</Text>
                </TouchableOpacity>
              )}

              {workOrder.status === "in-progress" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.resolveButton]}
                    onPress={handleResolve}
                    disabled={actionLoading}
                  >
                    <Text style={styles.actionButtonText}>Resolve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.escalateButton]}
                    onPress={handleEscalate}
                    disabled={actionLoading}
                  >
                    <Text style={styles.actionButtonText}>Escalate</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: SPACING.medium,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    padding: SPACING.large,
  },
  statusCard: {
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  card: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  issueText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: SPACING.small,
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    fontWeight: "500",
  },
  actionsSection: {
    padding: SPACING.large,
    gap: SPACING.medium,
  },
  actionButton: {
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: "center",
  },
  assignButton: {
    backgroundColor: "#2196F3",
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  resolveButton: {
    backgroundColor: "#4CAF50",
  },
  escalateButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WorkOrderDetailsScreen;
