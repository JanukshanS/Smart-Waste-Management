import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "react-native-paper";
import { COLORS, SPACING } from "../../constants/theme";
import { technicianApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const TechnicianDashboardScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) return;

      const response = await technicianApi.getWorkOrders({
        technicianId: userId,
      });

      if (response.success) {
        setWorkOrders(response.data || []);

        // Calculate stats
        const pending = response.data.filter(
          (wo) => wo.status === "pending"
        ).length;
        const inProgress = response.data.filter(
          (wo) => wo.status === "in-progress"
        ).length;
        const resolved = response.data.filter(
          (wo) => wo.status === "resolved"
        ).length;
        const urgent = response.data.filter(
          (wo) => wo.priority === "urgent"
        ).length;

        setStats({ pending, inProgress, resolved, urgent });
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const result = await logout();
          if (result.success) {
            router.replace("/auth-landing");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const StatBox = ({ value, label, icon, color = COLORS.primary }) => (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <Text style={styles.statBoxIcon}>{icon}</Text>
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );

  const ActionCard = ({
    title,
    description,
    icon,
    onPress,
    color = COLORS.primary,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={styles.actionCard}
      activeOpacity={0.7}
    >
      <View
        style={[styles.actionIconContainer, { backgroundColor: color + "15" }]}
      >
        <Text style={[styles.actionIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Text style={[styles.actionArrow, { color }]}>›</Text>
    </TouchableOpacity>
  );

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

  const urgentWorkOrders = workOrders
    .filter((wo) => wo.priority === "urgent" && wo.status !== "resolved")
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.title}>{user?.name || "Technician"}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchDashboardData}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <StatBox
              value={stats.pending}
              label="Pending"
              icon="⏳"
              color="#FFA500"
            />
            <StatBox
              value={stats.inProgress}
              label="In Progress"
              icon="🔧"
              color={COLORS.primary}
            />
            <StatBox
              value={stats.urgent}
              label="Urgent"
              icon="🚨"
              color={COLORS.error}
            />
            <StatBox
              value={stats.resolved}
              label="Resolved"
              icon="✅"
              color="#4CAF50"
            />
          </View>
        </View>

        {/* Urgent Work Orders */}
        {urgentWorkOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Urgent Work Orders</Text>
            {urgentWorkOrders.map((wo) => (
              <TouchableOpacity
                key={wo._id}
                onPress={() =>
                  router.push(`/technician/work-order-details?id=${wo._id}`)
                }
              >
                <Card style={styles.workOrderCard}>
                  <Card.Content>
                    <View style={styles.workOrderHeader}>
                      <Text style={styles.workOrderTitle}>
                        {wo.issueDescription || "Work Order"}
                      </Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: getPriorityColor(wo.priority) },
                        ]}
                      >
                        <Text style={styles.priorityBadgeText}>
                          {wo.priority}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.workOrderDetail}>
                      Device: {wo.deviceId || "N/A"}
                    </Text>
                    <Text style={styles.workOrderDetail}>
                      Bin: {wo.binId || "N/A"}
                    </Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <ActionCard
            title="All Work Orders"
            description="View and manage work orders"
            icon="📋"
            color={COLORS.primary}
            onPress={() => router.push("/technician/work-orders")}
          />

          <ActionCard
            title="Register Device"
            description="Register a new smart device"
            icon="📱"
            color={COLORS.secondary}
            onPress={() => router.push("/technician/register-device")}
          />

          <ActionCard
            title="Scan QR Code"
            description="Scan device or bin QR code"
            icon="📷"
            color="#9C27B0"
            onPress={() => router.push("/technician/qr-scanner")}
          />
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.large,
    paddingBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshIcon: {
    fontSize: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: SPACING.medium,
    borderRadius: 12,
    marginHorizontal: SPACING.large,
    marginTop: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: SPACING.large,
    marginTop: SPACING.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    width: "48%",
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.medium,
  },
  statBoxIcon: {
    fontSize: 24,
    marginBottom: SPACING.small,
  },
  statBoxValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.medium,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actionArrow: {
    fontSize: 32,
    fontWeight: "300",
  },
  workOrderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  workOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  workOrderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  workOrderDetail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
});

export default TechnicianDashboardScreen;
