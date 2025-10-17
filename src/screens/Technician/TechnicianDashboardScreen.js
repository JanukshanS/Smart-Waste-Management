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
import DashboardHeader from "../../components/DashboardHeader";
import Button from "../../components/Button";

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
      <DashboardHeader 
        title="Technician Dashboard"
        subtitle="Device Maintenance & Repairs"
        rightComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Work Order Statistics</Text>
          <View style={styles.statsGrid}>
            <StatBox 
              value={stats.pending} 
              label="Pending" 
              icon="" 
              color={COLORS.warning} 
            />
            <StatBox 
              value={stats.inProgress} 
              label="In Progress" 
              icon="" 
              color={COLORS.primary} 
            />
            <StatBox 
              value={stats.resolved} 
              label="Resolved" 
              icon="" 
              color={COLORS.success} 
            />
            <StatBox 
              value={stats.urgent} 
              label="Urgent" 
              icon="" 
              color={COLORS.error} 
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ActionCard
            title="Work Orders"
            description="View and manage work orders"
            icon=""
            onPress={() => router.push('/technician/work-orders')}
            color={COLORS.primary}
          />
          <ActionCard
            title="Device Management"
            description="Register and manage devices"
            icon=""
            onPress={() => router.push('/technician/devices')}
            color={COLORS.secondary}
          />
          <ActionCard
            title="Parts Availability"
            description="View parts availability"
            icon=""
            onPress={() => router.push('/technician/availability')}
            color={COLORS.success}
          />
        </View>

        {/* Urgent Work Orders */}
        {urgentWorkOrders.length > 0 && (
          <View style={styles.urgentSection}>
            <Text style={styles.sectionTitle}>Urgent Work Orders</Text>
            {urgentWorkOrders.map((workOrder) => (
              <TouchableOpacity
                key={workOrder._id}
                style={styles.workOrderCard}
                onPress={() => router.push(`/technician/work-order-details?id=${workOrder._id}`)}
              >
                <View style={styles.workOrderHeader}>
                  <Text style={styles.workOrderTitle}>{workOrder.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(workOrder.priority) }]}>
                    <Text style={styles.priorityBadgeText}>{workOrder.priority}</Text>
                  </View>
                </View>
                <Text style={styles.workOrderDetail}>Device: {workOrder.deviceId}</Text>
                <Text style={styles.workOrderDetail}>Status: {workOrder.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.large,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
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
    marginTop: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  statsSection: {
    marginBottom: SPACING.large,
  },
  actionsSection: {
    marginBottom: SPACING.large,
  },
  urgentSection: {
    marginBottom: SPACING.large,
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
    borderRadius: 10,
    borderLeftWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SPACING.medium,
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
    borderRadius: 10,
    marginBottom: SPACING.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
