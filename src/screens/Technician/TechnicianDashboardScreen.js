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
      <DashboardHeader 
        title="Technician Dashboard"
        subtitle="Device Maintenance & Repairs"
        rightComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.buttonContainer}>
          <Button 
            title="Work Orders" 
            onPress={() => router.push('/technician/work-orders')}
          />
          
          <Button 
            title="Device Management" 
            onPress={() => router.push('/technician/devices')}
          />
          
          <Button 
            title="Parts Availability" 
            onPress={() => router.push('/technician/parts-availability')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: SPACING.medium,
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
