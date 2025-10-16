import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
  Dimensions 
} from 'react-native';
import { router } from 'expo-router';
import { dashboardApi } from '../src/api';

const { width } = Dimensions.get('window');

// Animated Stat Card Component
const AnimatedStatCard = ({ value, label, icon, isPrimary, isAlert, delay = 0 }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        isPrimary && styles.statCardPrimary,
        isAlert && styles.statCardAlert,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.statIconContainer}>
        <Text style={[styles.statIcon, isPrimary && styles.statIconPrimary, isAlert && styles.statIconAlert]}>
          {icon}
        </Text>
      </View>
      <Text style={[styles.statNumber, isPrimary && styles.statNumberPrimary, isAlert && styles.statNumberAlert]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, isPrimary && styles.statLabelPrimary, isAlert && styles.statLabelAlert]}>
        {label}
      </Text>
    </Animated.View>
  );
};

// Progress Bar Component
const ProgressBar = ({ current, total, color = '#22c55e' }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const [widthAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBg}>
        <Animated.View 
          style={[
            styles.progressBarFill, 
            { width: animatedWidth, backgroundColor: color }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
    </View>
  );
};

// Interactive Section Card
const SectionCard = ({ title, icon, children, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[styles.sectionCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>{icon}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <Text style={styles.sectionArrow}>›</Text>
        </View>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [headerAnim] = useState(new Animated.Value(0));

  const fetchDashboardData = async () => {
    try {
      const result = await dashboardApi.getStats();
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>↻ Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const data = dashboardData || {};

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerGradient}>
          <Text style={styles.headerTitle}>📊 Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time System Overview</Text>
          <View style={styles.headerBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.headerBadgeText}>Live</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#22c55e']}
            tintColor="#22c55e"
          />
        }
      >
        {/* Quick Stats Overview */}
        <View style={styles.quickStatsContainer}>
          <AnimatedStatCard
            value={data.users?.total || 0}
            label="Total Users"
            icon="👥"
            isPrimary
            delay={0}
          />
          <AnimatedStatCard
            value={data.requests?.total || 0}
            label="Requests"
            icon="📋"
            delay={100}
          />
          <AnimatedStatCard
            value={data.bins?.total || 0}
            label="Smart Bins"
            icon="🗑️"
            delay={200}
          />
          <AnimatedStatCard
            value={data.devices?.total || 0}
            label="Devices"
            icon="📱"
            delay={300}
          />
        </View>

        {/* Users Section */}
        <SectionCard title="User Management" icon="👥" onPress={() => console.log('Users pressed')}>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNumber}>{data.users?.active || 0}</Text>
              <Text style={styles.miniStatLabel}>Active</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNumber}>{data.users?.total || 0}</Text>
              <Text style={styles.miniStatLabel}>Total</Text>
            </View>
          </View>
          
          {data.users?.byRole && data.users.byRole.length > 0 && (
            <View style={styles.roleGrid}>
              {data.users.byRole.map((role, index) => (
                <View key={index} style={styles.roleBadge}>
                  <Text style={styles.roleBadgeCount}>{role.count}</Text>
                  <Text style={styles.roleBadgeLabel}>{role._id}</Text>
                </View>
              ))}
            </View>
          )}
          
          <ProgressBar 
            current={data.users?.active || 0} 
            total={data.users?.total || 1}
            color="#22c55e"
          />
        </SectionCard>

        {/* Waste Requests Section */}
        <SectionCard title="Waste Requests" icon="📋" onPress={() => console.log('Requests pressed')}>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>{data.requests?.pending || 0}</Text>
              <Text style={styles.gridLabel}>Pending</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.successColor]}>{data.requests?.completed || 0}</Text>
              <Text style={styles.gridLabel}>Completed</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.primaryColor]}>{data.requests?.thisMonth || 0}</Text>
              <Text style={styles.gridLabel}>This Month</Text>
            </View>
          </View>
          
          <ProgressBar 
            current={data.requests?.completed || 0} 
            total={data.requests?.total || 1}
            color="#10b981"
          />
        </SectionCard>

        {/* Smart Bins Section */}
        <SectionCard title="Smart Bins Status" icon="🗑️" onPress={() => console.log('Bins pressed')}>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNumber}>{data.bins?.active || 0}</Text>
              <Text style={styles.miniStatLabel}>Active</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatNumber, styles.alertColor]}>{data.bins?.full || 0}</Text>
              <Text style={styles.miniStatLabel}>Full</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNumber}>{data.bins?.total || 0}</Text>
              <Text style={styles.miniStatLabel}>Total</Text>
            </View>
          </View>

          {(data.bins?.full || 0) > 0 && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertBannerIcon}>⚠️</Text>
              <Text style={styles.alertBannerText}>
                {data.bins.full} bin{data.bins.full > 1 ? 's' : ''} need{data.bins.full === 1 ? 's' : ''} attention
              </Text>
            </View>
          )}
        </SectionCard>

        {/* Routes Section */}
        <SectionCard title="Collection Routes" icon="🚛" onPress={() => console.log('Routes pressed')}>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.gridNumber}>{data.routes?.active || 0}</Text>
              <Text style={styles.gridLabel}>Active</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.successColor]}>{data.routes?.completed || 0}</Text>
              <Text style={styles.gridLabel}>Completed</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.primaryColor]}>{data.routes?.total || 0}</Text>
              <Text style={styles.gridLabel}>Total</Text>
            </View>
          </View>
        </SectionCard>

        {/* Devices Section */}
        <SectionCard title="IoT Devices" icon="📱" onPress={() => console.log('Devices pressed')}>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatNumber, styles.successColor]}>{data.devices?.active || 0}</Text>
              <Text style={styles.miniStatLabel}>Online</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatNumber, styles.alertColor]}>{data.devices?.offline || 0}</Text>
              <Text style={styles.miniStatLabel}>Offline</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatNumber}>{data.devices?.total || 0}</Text>
              <Text style={styles.miniStatLabel}>Total</Text>
            </View>
          </View>

          <ProgressBar 
            current={data.devices?.active || 0} 
            total={data.devices?.total || 1}
            color="#22c55e"
          />

          {(data.devices?.offline || 0) > 0 && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertBannerIcon}>🔴</Text>
              <Text style={styles.alertBannerText}>
                {data.devices.offline} device{data.devices.offline > 1 ? 's' : ''} offline
              </Text>
            </View>
          )}
        </SectionCard>

        {/* Work Orders Section */}
        <SectionCard title="Work Orders" icon="🔧" onPress={() => console.log('Work Orders pressed')}>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.warningColor]}>{data.workOrders?.pending || 0}</Text>
              <Text style={styles.gridLabel}>Pending</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.successColor]}>{data.workOrders?.resolved || 0}</Text>
              <Text style={styles.gridLabel}>Resolved</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridNumber, styles.primaryColor]}>{data.workOrders?.total || 0}</Text>
              <Text style={styles.gridLabel}>Total</Text>
            </View>
          </View>
        </SectionCard>

        {/* Create Account Button with Expo Router */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/signup')}
          activeOpacity={0.8}
        >
          <View style={styles.createButtonGradient}>
            <Text style={styles.createButtonIcon}>➕</Text>
            <Text style={styles.createButtonText}>Create New Account</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#22c55e',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#22c55e',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  headerGradient: {
    position: 'relative',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.95,
    marginBottom: 15,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -30,
    marginBottom: 10,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardPrimary: {
    backgroundColor: '#22c55e',
  },
  statCardAlert: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 32,
  },
  statIconPrimary: {
    opacity: 0.9,
  },
  statIconAlert: {
    opacity: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statNumberPrimary: {
    color: '#ffffff',
  },
  statNumberAlert: {
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  statLabelPrimary: {
    color: '#ffffff',
    opacity: 0.95,
  },
  statLabelAlert: {
    color: '#991b1b',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionArrow: {
    fontSize: 32,
    color: '#22c55e',
    fontWeight: '300',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gridNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  roleBadgeCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  roleBadgeLabel: {
    fontSize: 13,
    color: '#166534',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    minWidth: 45,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertBannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#991b1b',
    fontWeight: '600',
  },
  createButton: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonGradient: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  createButtonIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  primaryColor: {
    color: '#22c55e',
  },
  successColor: {
    color: '#10b981',
  },
  warningColor: {
    color: '#f59e0b',
  },
  alertColor: {
    color: '#ef4444',
  },
  bottomPadding: {
    height: 40,
  },
});

