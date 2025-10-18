import React, { useState, useEffect } from 'react';
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
import { coordinatorApi } from "../../api";
import { BinMapView } from "../../components/Coordinator";
import { useAuth } from "../../contexts/AuthContext";

const CoordinatorDashboardScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [urgentBins, setUrgentBins] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const response = await coordinatorApi.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
        setError(null);
      }

      // Fetch urgent bins for map widget
      const binsResponse = await coordinatorApi.getBins({
        fillLevel: { gte: 90 },
        limit: 10,
        sort: "fillLevel:desc",
      });
      if (binsResponse.success) {
        setUrgentBins(binsResponse.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              router.replace('/auth-landing');
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

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

  const StatBox = ({ value, label, icon, color = COLORS.primary, trend }) => (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <View style={styles.statBoxHeader}>
        <Text style={styles.statBoxIcon}>{icon}</Text>
        {trend && (
          <Text
            style={[
              styles.trendText,
              { color: trend > 0 ? "#4CAF50" : COLORS.error },
            ]}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </Text>
        )}
      </View>
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );

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
            <Text style={styles.title}>Coordinator Dashboard</Text>
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

        {dashboardData && (
          <>
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <StatBox
                value={dashboardData.bins?.total || 0}
                label="Total Bins"
                icon="🗑️"
                color={COLORS.primary}
              />
              <StatBox
                value={dashboardData.bins?.full || 0}
                label="Full Bins"
                icon="🔴"
                color={COLORS.error}
              />
              <StatBox
                value={dashboardData.requests?.pending || 0}
                label="Pending Requests"
                icon="⏳"
                color="#FFA500"
              />
              <StatBox
                value={dashboardData.routes?.active || 0}
                label="Active Routes"
                icon="🚛"
                color="#4CAF50"
              />
            </View>

            {/* Status Overview Cards */}
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>Status Overview</Text>

              {/* Bins Overview Card */}
              <Card style={styles.overviewCard}>
                <Card.Content>
                  <View style={styles.overviewHeader}>
                    <View>
                      <Text style={styles.overviewTitle}>🗑️ Smart Bins</Text>
                      <Text style={styles.overviewSubtitle}>
                        Real-time monitoring
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push("/coordinator/bins")}
                    >
                      <Text style={styles.viewAllText}>View All ›</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressRow}>
                      <View style={styles.progressLabel}>
                        <View
                          style={[
                            styles.progressDot,
                            { backgroundColor: COLORS.error },
                          ]}
                        />
                        <Text style={styles.progressText}>Full</Text>
                      </View>
                      <Text style={styles.progressValue}>
                        {dashboardData.bins?.full || 0}
                      </Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressLabel}>
                        <View
                          style={[
                            styles.progressDot,
                            { backgroundColor: "#FFA500" },
                          ]}
                        />
                        <Text style={styles.progressText}>Filling</Text>
                      </View>
                      <Text style={styles.progressValue}>
                        {dashboardData.bins?.filling || 0}
                      </Text>
                    </View>
                    <View style={styles.progressRow}>
                      <View style={styles.progressLabel}>
                        <View
                          style={[
                            styles.progressDot,
                            { backgroundColor: "#4CAF50" },
                          ]}
                        />
                        <Text style={styles.progressText}>Normal</Text>
                      </View>
                      <Text style={styles.progressValue}>
                        {(dashboardData.bins?.total || 0) -
                          (dashboardData.bins?.full || 0) -
                          (dashboardData.bins?.filling || 0)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              {/* Requests Overview Card */}
              <Card style={styles.overviewCard}>
                <Card.Content>
                  <View style={styles.overviewHeader}>
                    <View>
                      <Text style={styles.overviewTitle}>
                        📋 Waste Requests
                      </Text>
                      <Text style={styles.overviewSubtitle}>
                        Manage collection requests
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => router.push("/coordinator/requests")}
                    >
                      <Text style={styles.viewAllText}>View All ›</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.requestStats}>
                    <View style={styles.requestStatItem}>
                      <Text
                        style={[styles.requestStatValue, { color: "#FFA500" }]}
                      >
                        {dashboardData.requests?.pending || 0}
                      </Text>
                      <Text style={styles.requestStatLabel}>Pending</Text>
                    </View>
                    <View style={styles.requestStatDivider} />
                    <View style={styles.requestStatItem}>
                      <Text
                        style={[styles.requestStatValue, { color: "#4CAF50" }]}
                      >
                        {dashboardData.requests?.approved || 0}
                      </Text>
                      <Text style={styles.requestStatLabel}>Approved</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <ActionCard
                title="Smart Bins"
                description="Monitor bin status and fill levels"
                icon="🗑️"
                color={COLORS.primary}
                onPress={() => router.push("/coordinator/bins")}
              />

              <ActionCard
                title="Bin Management"
                description="Advanced bin monitoring and management"
                icon="⚙️"
                color="#9C27B0"
                onPress={() => router.push("/coordinator/bin-management")}
              />

              <ActionCard
                title="Manage Requests"
                description="Review pending waste collection requests"
                icon="✅"
                color="#FFA500"
                onPress={() => router.push("/coordinator/requests")}
              />

              <ActionCard
                title="Collection Routes"
                description="View and manage collection routes"
                icon="🗺️"
                color="#4CAF50"
                onPress={() => router.push("/coordinator/routes")}
              />

              <ActionCard
                title="Create Route"
                description="Generate optimized collection route"
                icon="➕"
                color={COLORS.primary}
                onPress={() => router.push("/coordinator/create-route")}
              />

              <ActionCard
                title="Manage Crews"
                description="View and manage collection crews"
                icon="👥"
                color="#2196F3"
                onPress={() => router.push("/coordinator/crews")}
              />

              <ActionCard
                title="Manage Vehicles"
                description="View and manage collection vehicles"
                icon="🚛"
                color="#FF5722"
                onPress={() => router.push("/coordinator/vehicles")}
              />
            </View>

            {/* Map Widget */}
            {urgentBins.length > 0 && (
              <View style={styles.mapSection}>
                <View style={styles.mapHeader}>
                  <Text style={styles.sectionTitle}>🚨 Urgent Bins Map</Text>
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push("/coordinator/bin-management")}
                  >
                    <Text style={styles.viewAllText}>View Full Map ›</Text>
                  </TouchableOpacity>
                </View>
                <BinMapView
                  bins={urgentBins}
                  onBinPress={(bin) =>
                    router.push(
                      `/coordinator/bin-details?id=${bin._id || bin.binId}`
                    )
                  }
                  height={250}
                  showControls={false}
                  showLegend={false}
                  filteredStatus="urgent"
                />
              </View>
            )}

            {/* Analytics Section */}
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>Analytics & Reports</Text>

              <View style={styles.analyticsGrid}>
                <TouchableOpacity
                  style={styles.analyticsCard}
                  onPress={() => router.push("/coordinator/analytics")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.analyticsIcon}>📊</Text>
                  <Text style={styles.analyticsLabel}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.analyticsCard}
                  onPress={() => router.push("/coordinator/collection-history")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.analyticsIcon}>📜</Text>
                  <Text style={styles.analyticsLabel}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.analyticsCard}
                  onPress={() => router.push("/coordinator/schedule")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.analyticsIcon}>📅</Text>
                  <Text style={styles.analyticsLabel}>Schedule</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.analyticsCard}
                  onPress={() => router.push("/coordinator/all-requests")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.analyticsIcon}>📝</Text>
                  <Text style={styles.analyticsLabel}>All Requests</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
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

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.large,
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
  statBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  statBoxIcon: {
    fontSize: 24,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
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

  // Overview Section
  overviewSection: {
    paddingHorizontal: SPACING.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
    marginTop: SPACING.small,
  },
  overviewCard: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  overviewSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  viewAllButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
    backgroundColor: COLORS.primary + "10",
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  progressContainer: {
    gap: SPACING.small,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.small,
  },
  progressLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  requestStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.large,
  },
  requestStatItem: {
    flex: 1,
    alignItems: "center",
  },
  requestStatValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  requestStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  requestStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: SPACING.large,
    marginTop: SPACING.small,
  },

  // Map Section
  mapSection: {
    paddingHorizontal: SPACING.large,
    marginTop: SPACING.large,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
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

  // Analytics Section
  analyticsSection: {
    paddingHorizontal: SPACING.large,
    marginTop: SPACING.small,
    paddingBottom: SPACING.large,
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.medium,
  },
  analyticsCard: {
    flex: 1,
    minWidth: "45%",
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsIcon: {
    fontSize: 36,
    marginBottom: SPACING.small,
  },
  analyticsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
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
    fontWeight: '600',
  },
});

export default CoordinatorDashboardScreen;

