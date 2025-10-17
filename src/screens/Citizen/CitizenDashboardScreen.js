import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { citizenApi } from '../../api';
import Button from '../../components/Button';
import DashboardHeader from '../../components/DashboardHeader';
import { citizenApi } from '../../api';

const CitizenDashboardScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

  // Hardcoded userId for now
  const userId = '68f17571b188a4a7463c1c27';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefreshing = false) => {
    isRefreshing ? setRefreshing(true) : setLoading(true);

    try {
      // Fetch all requests to calculate stats
      const response = await citizenApi.getMyRequests({ userId, limit: 100 });

      if (response.success) {
        const requests = response.data;

        // Calculate statistics
        const statsData = {
          total: requests.length,
          pending: requests.filter((r) => r.status === 'pending').length,
          completed: requests.filter((r) => r.status === 'completed').length,
          inProgress: requests.filter((r) => r.status === 'in-progress').length,
        };

        setStats(statsData);

        // Get 3 most recent requests
        setRecentRequests(requests.slice(0, 3));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: COLORS.warning, icon: '⏳' };
      case 'approved':
        return { color: COLORS.info, icon: '✓' };
      case 'scheduled':
        return { color: '#1976D2', icon: '📅' };
      case 'in-progress':
        return { color: '#F57C00', icon: '🚛' };
      case 'completed':
        return { color: COLORS.success, icon: '✅' };
      case 'cancelled':
        return { color: COLORS.danger, icon: '❌' };
      default:
        return { color: COLORS.gray, icon: '?' };
    }
  };

  const getWasteTypeIcon = (wasteType) => {
    switch (wasteType) {
      case 'household': return '🏠';
      case 'recyclable': return '♻️';
      case 'organic': return '🌱';
      case 'electronic': return '📱';
      case 'hazardous': return '⚠️';
      default: return '🗑️';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.citizenAccent]}
            tintColor={COLORS.citizenAccent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hello! 👋</Text>
              <Text style={styles.subtitle}>Let's keep our environment clean</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Statistics Overview */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardPrimary]}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>📊</Text>
                </View>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>

              <View style={[styles.statCard, styles.statCardWarning]}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>⏳</Text>
                </View>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={[styles.statCard, styles.statCardInfo]}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>🚛</Text>
                </View>
                <Text style={styles.statNumber}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>

              <View style={[styles.statCard, styles.statCardSuccess]}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>✅</Text>
                </View>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/citizen/my-requests')}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Text style={styles.actionButtonEmoji}>📋</Text>
                </View>
                <Text style={styles.actionButtonText}>My Requests</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/citizen/find-bins')}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Text style={styles.actionButtonEmoji}>📍</Text>
                </View>
                <Text style={styles.actionButtonText}>Find Bins</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/citizen/profile')}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Text style={styles.actionButtonEmoji}>👤</Text>
                </View>
                <Text style={styles.actionButtonText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Requests */}
          {recentRequests.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push('/citizen/my-requests')}>
                  <Text style={styles.seeAllLink}>View All →</Text>
                </TouchableOpacity>
              </View>

              {recentRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                const wasteTypeIcon = getWasteTypeIcon(request.wasteType);

                return (
                  <TouchableOpacity
                    key={request._id}
                    style={styles.recentCard}
                    onPress={() => router.push(`/citizen/track-request?id=${request._id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentCardIcon}>
                      <Text style={styles.recentCardEmoji}>{wasteTypeIcon}</Text>
                    </View>
                    <View style={styles.recentCardContent}>
                      <Text style={styles.recentCardTitle}>{request.wasteType}</Text>
                      <Text style={styles.recentCardSubtitle}>
                        {request.quantity} • {formatDate(request.createdAt)}
                      </Text>
                    </View>
                    <View style={[styles.recentCardBadge, { backgroundColor: statusConfig.color }]}>
                      <Text style={styles.recentCardBadgeText}>{statusConfig.icon}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Empty State */}
          {recentRequests.length === 0 && (
            <View style={styles.emptySection}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🌱</Text>
                <Text style={styles.emptyTitle}>Start Your Journey</Text>
                <Text style={styles.emptyText}>
                  Create your first waste collection request and contribute to a cleaner environment
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/citizen/create-request')}
                >
                  <Text style={styles.emptyButtonText}>Create Request</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/citizen/create-request')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.citizenBackground,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.citizenBackground,
    backgroundColor: COLORS.citizenBackground,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.citizenBackground,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.citizenTextMedium,
  },
  
  // Header Styles
  header: {
    backgroundColor: COLORS.citizenPrimary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.white,
    opacity: 0.9,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.citizenBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  
  // Statistics Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.citizenTextDark,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenPrimary,
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenWarning,
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenInfo,
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenSuccess,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.citizenTextGray,
  },
  
  // Quick Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.citizenBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonEmoji: {
    fontSize: 28,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
    textAlign: 'center',
  },
  
  // Recent Requests Section
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.citizenAccent,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.citizenBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentCardEmoji: {
    fontSize: 24,
  },
  recentCardContent: {
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.citizenTextMedium,
  },
  
  // Header Styles
  header: {
    backgroundColor: COLORS.citizenPrimary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.white,
    opacity: 0.9,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.citizenBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  
  // Statistics Section
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.citizenTextDark,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenPrimary,
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenWarning,
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenInfo,
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.citizenSuccess,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.citizenTextGray,
  },
  
  // Quick Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.citizenBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonEmoji: {
    fontSize: 28,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
    textAlign: 'center',
  },
  
  // Recent Requests Section
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.citizenAccent,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recentCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.citizenBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentCardEmoji: {
    fontSize: 24,
  },
  recentCardContent: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  recentCardSubtitle: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
  },
  recentCardBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardBadgeText: {
    fontSize: 16,
  },
  
  // Empty State
  emptySection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  recentCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  recentCardSubtitle: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
  },
  recentCardBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardBadgeText: {
    fontSize: 16,
  },
  
  // Empty State
  emptySection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.citizenTextGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.citizenAccent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 24,
    backgroundColor: COLORS.citizenAccent,
    borderRadius: 32,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.citizenTextGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.citizenAccent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 24,
    backgroundColor: COLORS.citizenAccent,
    borderRadius: 32,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
  },
});

export default CitizenDashboardScreen;

