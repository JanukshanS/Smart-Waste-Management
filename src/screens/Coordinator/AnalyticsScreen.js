import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalCollections: 0,
    completionRate: 0,
    totalBinsServiced: 0,
    avgFillLevel: 0,
    totalDistance: 0,
    avgRouteTime: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  const fetchAnalytics = async () => {
    try {
      setError(null);
      
      // Fetch dashboard data
      const dashboardResponse = await coordinatorApi.getDashboard();
      
      // Fetch routes for analytics
      const routesResponse = await coordinatorApi.getRoutes();
      
      // Fetch bins for analytics
      const binsResponse = await coordinatorApi.getBins();

      if (dashboardResponse.success && routesResponse.success && binsResponse.success) {
        const dashboard = dashboardResponse.data;
        const routes = routesResponse.data;
        const bins = binsResponse.data;

        // Calculate analytics
        const completedRoutes = routes.filter(r => r.status === 'completed');
        const totalRoutes = routes.length;
        const completionRate = totalRoutes > 0 ? (completedRoutes.length / totalRoutes) * 100 : 0;

        // Calculate total bins serviced
        const binsServiced = completedRoutes.reduce((sum, route) => {
          const binStops = route.stops?.filter(s => s.stopType === 'bin' && s.status === 'completed') || [];
          return sum + binStops.length;
        }, 0);

        // Calculate average fill level
        const avgFillLevel = bins.length > 0 
          ? bins.reduce((sum, bin) => sum + (bin.fillLevel || 0), 0) / bins.length 
          : 0;

        // Calculate total distance
        const totalDistance = completedRoutes.reduce((sum, route) => sum + (route.totalDistance || 0), 0);

        // Calculate average route time
        const avgRouteTime = completedRoutes.length > 0
          ? completedRoutes.reduce((sum, route) => sum + (route.estimatedDuration || 0), 0) / completedRoutes.length
          : 0;

        setAnalytics({
          totalCollections: completedRoutes.length,
          completionRate: Math.round(completionRate),
          totalBinsServiced: binsServiced,
          avgFillLevel: Math.round(avgFillLevel),
          totalDistance: Math.round(totalDistance * 10) / 10,
          avgRouteTime: Math.round(avgRouteTime),
          pendingRequests: dashboard.requests?.pending || 0,
          approvedRequests: dashboard.requests?.approved || 0,
          rejectedRequests: 0, // Would need additional API call
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Collection Analytics</Text>
        <Text style={styles.subtitle}>Performance metrics and statistics</Text>

        {/* Time Range Filter */}
        <View style={styles.filterContainer}>
          <Chip
            selected={timeRange === 'week'}
            onPress={() => handleTimeRangeChange('week')}
            style={styles.filterChip}
          >
            Last Week
          </Chip>
          <Chip
            selected={timeRange === 'month'}
            onPress={() => handleTimeRangeChange('month')}
            style={styles.filterChip}
          >
            Last Month
          </Chip>
          <Chip
            selected={timeRange === 'all'}
            onPress={() => handleTimeRangeChange('all')}
            style={styles.filterChip}
          >
            All Time
          </Chip>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Collection Metrics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Collection Performance</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.totalCollections}</Text>
                <Text style={styles.metricLabel}>Total Collections</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
                  {analytics.completionRate}%
                </Text>
                <Text style={styles.metricLabel}>Completion Rate</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Bin Metrics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Bin Statistics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.totalBinsServiced}</Text>
                <Text style={styles.metricLabel}>Bins Serviced</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { 
                  color: analytics.avgFillLevel >= 70 ? COLORS.error : '#4CAF50' 
                }]}>
                  {analytics.avgFillLevel}%
                </Text>
                <Text style={styles.metricLabel}>Avg Fill Level</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Route Metrics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Route Efficiency</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.totalDistance} km</Text>
                <Text style={styles.metricLabel}>Total Distance</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.avgRouteTime} min</Text>
                <Text style={styles.metricLabel}>Avg Route Time</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Request Metrics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Request Statistics</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricColumn}>
                <Text style={[styles.metricValue, { color: '#FFA500' }]}>
                  {analytics.pendingRequests}
                </Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
              <View style={styles.metricColumn}>
                <Text style={[styles.metricValue, { color: '#4CAF50' }]}>
                  {analytics.approvedRequests}
                </Text>
                <Text style={styles.metricLabel}>Approved</Text>
              </View>
              <View style={styles.metricColumn}>
                <Text style={[styles.metricValue, { color: COLORS.error }]}>
                  {analytics.rejectedRequests}
                </Text>
                <Text style={styles.metricLabel}>Rejected</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Summary Card */}
        <Card style={[styles.card, styles.summaryCard]}>
          <Card.Content>
            <Text style={styles.cardTitle}>Performance Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Collection Efficiency</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${analytics.completionRate}%`,
                        backgroundColor: analytics.completionRate >= 80 ? '#4CAF50' : '#FFA500'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.summaryValue}>{analytics.completionRate}%</Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Bin Utilization</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${analytics.avgFillLevel}%`,
                        backgroundColor: analytics.avgFillLevel >= 70 ? COLORS.error : '#4CAF50'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.summaryValue}>{analytics.avgFillLevel}%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Note about charts */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noteText}>
              📊 Interactive charts with historical trends will be available in a future update.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
    marginBottom: SPACING.large,
  },
  filterChip: {
    marginBottom: SPACING.small,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  summaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  summaryContent: {
    gap: SPACING.large,
  },
  summaryItem: {
    gap: SPACING.small,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  noteText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AnalyticsScreen;

