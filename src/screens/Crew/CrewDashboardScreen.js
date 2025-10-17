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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { crewApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';

const CrewDashboardScreen = () => {
  const router = useRouter();
  const { user, logout, clearUserData } = useAuth();
  const { userDetails, clearUserDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      // Use logged-in user's ID from user details context or auth context
      const userId = userDetails?.id || userDetails?._id || user?.id || user?._id;
      
      if (!userId) {
        console.error('User object:', JSON.stringify(user, null, 2));
        console.error('UserDetails object:', JSON.stringify(userDetails, null, 2));
        throw new Error('User ID not found');
      }

      // Get crew details which includes dashboard data and current route
      const dashResponse = await crewApi.getDashboard(userId);

      if (dashResponse.success && dashResponse.data) {
        const { crew, profile, currentRoute, routeHistory } = dashResponse.data;
        
        // Set dashboard data from profile performance metrics
        setDashboardData({
          totalRoutes: profile?.performanceMetrics?.totalRoutesCompleted || 0,
          completedStops: profile?.performanceMetrics?.totalStopsCompleted || 0,
          averageCompletionTime: profile?.performanceMetrics?.averageCompletionTime || 0,
          onTimeRate: profile?.performanceMetrics?.onTimeCompletionRate || 0,
          routeHistory: routeHistory || []
        });

        // Set active route if exists
        if (currentRoute) {
          setActiveRoute(currentRoute);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchDashboardData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, userDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          // Clear both contexts
          clearUserDetails();
          clearUserData();
          
          const result = await logout();
          if (result.success) {
            router.replace('/auth-landing');
          } else {
            Alert.alert('Error', 'Failed to logout. Please try again.');
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

  const ActionCard = ({ title, description, icon, onPress, color = COLORS.primary }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionCard} activeOpacity={0.7}>
      <View style={[styles.actionIconContainer, { backgroundColor: color + '15' }]}>
        <Text style={[styles.actionIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Text style={[styles.actionArrow, { color }]}>›</Text>
    </TouchableOpacity>
  );

  const StatBox = ({ value, label, icon, color = COLORS.primary }) => (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <Text style={styles.statBoxIcon}>{icon}</Text>
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.title}>{userDetails?.name || user?.name || 'Crew Member'}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchDashboardData}>
              <Text style={styles.refreshIcon}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Active Route Card */}
        {activeRoute ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚛 Active Route</Text>
            <Card style={styles.activeRouteCard}>
              <Card.Content>
                <View style={styles.routeHeader}>
                  <View>
                    <Text style={styles.routeName}>{activeRoute.routeName}</Text>
                    <Text style={styles.routeDate}>
                      {new Date(activeRoute.scheduledDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusBadgeText}>{activeRoute.status}</Text>
                  </View>
                </View>

                <View style={styles.routeProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${activeRoute.completionPercentage || 0}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{activeRoute.completionPercentage || 0}% Complete</Text>
                </View>

                <View style={styles.routeStats}>
                  <View style={styles.routeStatItem}>
                    <Text style={styles.routeStatValue}>
                      {(activeRoute.stops && Array.isArray(activeRoute.stops)) ? activeRoute.stops.length : 0}
                    </Text>
                    <Text style={styles.routeStatLabel}>Total Stops</Text>
                  </View>
                  <View style={styles.routeStatDivider} />
                  <View style={styles.routeStatItem}>
                    <Text style={styles.routeStatValue}>
                      {(activeRoute.stops && Array.isArray(activeRoute.stops)) 
                        ? activeRoute.stops.filter((s) => s.status === 'completed').length 
                        : 0}
                    </Text>
                    <Text style={styles.routeStatLabel}>Completed</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.routeButton}
                  onPress={() => router.push(`/crew/route-details?id=${activeRoute._id}`)}
                >
                  <Text style={styles.routeButtonText}>View Route Details</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          </View>
        ) : (
          <View style={styles.section}>
            <Card style={styles.noRouteCard}>
              <Card.Content style={styles.noRouteContent}>
                <Text style={styles.noRouteIcon}>📭</Text>
                <Text style={styles.noRouteText}>No Active Route</Text>
                <Text style={styles.noRouteSubtext}>You don't have any assigned routes at the moment</Text>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Quick Stats */}
        {dashboardData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Stats</Text>
            <View style={styles.statsGrid}>
              <StatBox
                value={dashboardData.totalRoutes || 0}
                label="Total Routes"
                icon="🗺️"
                color={COLORS.primary}
              />
              <StatBox
                value={dashboardData.completedStops || 0}
                label="Completed Stops"
                icon="✅"
                color="#4CAF50"
              />
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <ActionCard
            title="My Routes"
            description="View all assigned routes"
            icon="🗺️"
            color={COLORS.primary}
            onPress={() => router.push('/crew/my-routes')}
          />

          <ActionCard
            title="Report Issue"
            description="Report problems during collection"
            icon="⚠️"
            color={COLORS.error}
            onPress={() => router.push('/crew/report-issue')}
          />

          <ActionCard
            title="My Profile"
            description="View and update your profile"
            icon="👤"
            color={COLORS.secondary}
            onPress={() => router.push('/crew/profile')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    paddingBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    borderRadius: 12,
    marginHorizontal: SPACING.large,
    marginTop: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SPACING.large,
    marginTop: SPACING.large,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  activeRouteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  routeDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  routeProgress: {
    marginBottom: SPACING.medium,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.small,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  routeStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  routeStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  routeStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  routeStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  routeButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  routeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  noRouteCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 2,
  },
  noRouteContent: {
    alignItems: 'center',
    paddingVertical: SPACING.large,
  },
  noRouteIcon: {
    fontSize: 48,
    marginBottom: SPACING.medium,
  },
  noRouteText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  noRouteSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  actionArrow: {
    fontSize: 32,
    fontWeight: '300',
  },
});

export default CrewDashboardScreen;

