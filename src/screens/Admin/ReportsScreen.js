import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { 
  Package, 
  Zap, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Truck, 
  BarChart3, 
  MapPin, 
  TrendingUp, 
  Target, 
  Car, 
  Leaf 
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { DateRangeSelector, ReportStatCard, TabBar } from '../../components/Admin';
import { adminApi } from '../../api';

const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [collectionsData, setCollectionsData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [startDate, setStartDate] = useState(getDateDaysAgo(30));
  const [endDate, setEndDate] = useState(getTodayDate());

  const tabs = [
    { icon: <Package size={20} color={COLORS.primary} />, label: 'Collections' },
    { icon: <Zap size={20} color={COLORS.primary} />, label: 'Efficiency' },
  ];

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  function getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  const fetchReports = async () => {
    try {
      setLoading(!refreshing);
      
      const [collectionsResponse, efficiencyResponse] = await Promise.all([
        adminApi.getCollectionReports(startDate, endDate),
        adminApi.getEfficiencyReports(startDate, endDate),
      ]);
      
      if (collectionsResponse.success) {
        setCollectionsData(collectionsResponse.data);
      }
      
      if (efficiencyResponse.success) {
        setEfficiencyData(efficiencyResponse.data);
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const setPresetRange = (days) => {
    setStartDate(getDateDaysAgo(days));
    setEndDate(getTodayDate());
  };

  const presets = [
    { label: 'Last 7 Days', onPress: () => setPresetRange(7) },
    { label: 'Last 30 Days', onPress: () => setPresetRange(30) },
    { label: 'Last 3 Months', onPress: () => setPresetRange(90) },
    { label: 'This Year', onPress: () => {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      setStartDate(startOfYear.toISOString().split('T')[0]);
      setEndDate(getTodayDate());
    }},
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>System Reports</Text>
        <Text style={styles.subtitle}>Analytics & Performance Insights</Text>
      </View>

      {/* Tab Bar */}
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Date Range Selector */}
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        presets={presets}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {activeTab === 0 ? (
          <CollectionsReport data={collectionsData} />
        ) : (
          <EfficiencyReport data={efficiencyData} />
        )}
      </ScrollView>
    </View>
  );
};

// Collections Report Component
const CollectionsReport = ({ data }) => {
  if (!data) return null;

  const collectionsByType = data.collectionsByType || {};
  const hasCollections = Object.keys(collectionsByType).length > 0;

  return (
    <View style={styles.reportContainer}>
      {/* Main Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<Package size={20} color={COLORS.primary} />}
              label="Total Collections"
              value={data.totalCollections || 0}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<ClipboardList size={20} color={COLORS.info} />}
              label="Total Requests"
              value={data.totalRequests || 0}
              color={COLORS.info}
            />
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<CheckCircle size={20} color={COLORS.success} />}
              label="Completion Rate"
              value={data.completionRate || '0%'}
              color={COLORS.success}
            />
          </View>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<Clock size={20} color={COLORS.warning} />}
              label="On-Time Rate"
              value={data.onTimeRate || '0%'}
              color={COLORS.warning}
            />
          </View>
        </View>

        <ReportStatCard
          icon={<Zap size={20} color={COLORS.secondary} />}
          label="Average Response Time"
          value={data.avgResponseTime || 'N/A'}
          color={COLORS.secondary}
        />
      </View>

      {/* Collections by Type */}
      {hasCollections && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collections by Type</Text>
          <View style={styles.typesList}>
            {Object.entries(collectionsByType).map(([type, count]) => (
              <View key={type} style={styles.typeItem}>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>{type}</Text>
                  <Text style={styles.typeCount}>{count} collections</Text>
                </View>
                <View style={styles.typeBar}>
                  <View 
                    style={[
                      styles.typeBarFill,
                      { 
                        width: `${(count / data.totalCollections) * 100}%`,
                        backgroundColor: COLORS.primary 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {!hasCollections && (
        <View style={styles.emptySection}>
          <BarChart3 size={48} color={COLORS.textLight} style={styles.emptyIconComponent} />
          <Text style={styles.emptyTitle}>No Collection Data</Text>
          <Text style={styles.emptyText}>
            No collections have been recorded for this period
          </Text>
        </View>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <BarChart3 size={28} color={COLORS.primary} style={styles.summaryIconComponent} />
          <Text style={styles.summaryLabel}>Total Activities</Text>
          <Text style={styles.summaryValue}>
            {(data.totalCollections || 0) + (data.totalRequests || 0)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Clock size={28} color={COLORS.warning} style={styles.summaryIconComponent} />
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
            {(data.totalRequests || 0) - (data.totalCollections || 0)}
          </Text>
        </View>
      </View>

      {/* Performance Indicator */}
      <View style={styles.performanceCard}>
        <Text style={styles.performanceTitle}>System Performance</Text>
        <View style={styles.performanceBar}>
          <View 
            style={[
              styles.performanceBarFill,
              {
                width: data.completionRate || '0%',
                backgroundColor: 
                  parseInt(data.completionRate) >= 80 ? COLORS.success :
                  parseInt(data.completionRate) >= 50 ? COLORS.warning :
                  COLORS.danger
              }
            ]}
          />
        </View>
        <Text style={styles.performanceLabel}>
          Overall Completion: {data.completionRate || '0%'}
        </Text>
      </View>
    </View>
  );
};

// Efficiency Report Component
const EfficiencyReport = ({ data }) => {
  if (!data) return null;

  return (
    <View style={styles.reportContainer}>
      {/* Main Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<Truck size={20} color={COLORS.primary} />}
              label="Total Routes"
              value={data.totalRoutes || 0}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<CheckCircle size={20} color={COLORS.success} />}
              label="Avg Completion"
              value={data.avgCompletionRate || 'N/A'}
              color={COLORS.success}
            />
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<MapPin size={20} color={COLORS.info} />}
              label="Total Distance"
              value={data.totalDistance || 'N/A'}
              color={COLORS.info}
            />
          </View>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<TrendingUp size={20} color={COLORS.secondary} />}
              label="Avg Distance/Route"
              value={data.avgDistancePerRoute || 'N/A'}
              color={COLORS.secondary}
            />
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<MapPin size={20} color={COLORS.warning} />}
              label="Avg Stops/Route"
              value={data.avgStopsPerRoute || 0}
              color={COLORS.warning}
            />
          </View>
          <View style={styles.statHalf}>
            <ReportStatCard
              icon={<Leaf size={20} color={COLORS.success} />}
              label="Fuel Savings"
              value={data.estimatedFuelSavings || '0 km'}
              color={COLORS.success}
            />
          </View>
        </View>
      </View>

      {/* Efficiency Highlights */}
      <View style={styles.highlightsSection}>
        <Text style={styles.sectionTitle}>Efficiency Highlights</Text>
        
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Target size={24} color={COLORS.primary} style={styles.highlightIconComponent} />
            <Text style={styles.highlightTitle}>Route Optimization</Text>
          </View>
          <View style={styles.highlightContent}>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Routes Completed:</Text>
              <Text style={styles.highlightValue}>{data.totalRoutes || 0}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Average Stops:</Text>
              <Text style={styles.highlightValue}>{data.avgStopsPerRoute || 0} per route</Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Completion Rate:</Text>
              <Text style={[styles.highlightValue, { color: COLORS.success }]}>
                {data.avgCompletionRate || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Car size={24} color={COLORS.primary} style={styles.highlightIconComponent} />
            <Text style={styles.highlightTitle}>Distance Metrics</Text>
          </View>
          <View style={styles.highlightContent}>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Total Distance:</Text>
              <Text style={styles.highlightValue}>{data.totalDistance || 'N/A'}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Avg per Route:</Text>
              <Text style={styles.highlightValue}>{data.avgDistancePerRoute || 'N/A'}</Text>
            </View>
            <View style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>Fuel Savings:</Text>
              <Text style={[styles.highlightValue, { color: COLORS.success }]}>
                {data.estimatedFuelSavings || '0 km'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Environmental Impact */}
      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <Leaf size={32} color={COLORS.white} style={styles.impactIconComponent} />
          <View>
            <Text style={styles.impactTitle}>Environmental Impact</Text>
            <Text style={styles.impactSubtitle}>Fuel Efficiency Savings</Text>
          </View>
        </View>
        <View style={styles.impactValue}>
          <Text style={styles.impactNumber}>{data.estimatedFuelSavings || '0 km'}</Text>
          <Text style={styles.impactLabel}>Optimized Distance</Text>
        </View>
      </View>

      {/* No Data State */}
      {data.totalRoutes === 0 && (
        <View style={styles.emptySection}>
          <Truck size={48} color={COLORS.textLight} style={styles.emptyIconComponent} />
          <Text style={styles.emptyTitle}>No Route Data</Text>
          <Text style={styles.emptyText}>
            No routes have been completed in this period
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.large,
    paddingTop: SPACING.large + 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  reportContainer: {
    paddingBottom: SPACING.large,
  },
  statsGrid: {
    padding: SPACING.medium,
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginBottom: SPACING.small,
  },
  statHalf: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.small,
    padding: SPACING.large,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  typesList: {
    gap: SPACING.medium,
  },
  typeItem: {
    marginBottom: SPACING.small,
  },
  typeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small / 2,
  },
  typeName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeCount: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  typeBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  typeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptySection: {
    alignItems: 'center',
    padding: SPACING.large * 2,
    marginTop: SPACING.large,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.medium,
  },
  emptyIconComponent: {
    marginBottom: SPACING.medium,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    padding: SPACING.medium,
    gap: SPACING.small,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    fontSize: 28,
    marginBottom: SPACING.small / 2,
  },
  summaryIconComponent: {
    marginBottom: SPACING.small / 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.small / 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.large,
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  performanceBar: {
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SPACING.small,
  },
  performanceBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  performanceLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  highlightsSection: {
    padding: SPACING.medium,
  },
  highlightCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    paddingBottom: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  highlightIcon: {
    fontSize: 24,
    marginRight: SPACING.small,
  },
  highlightIconComponent: {
    marginRight: SPACING.small,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  highlightContent: {
    gap: SPACING.small,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  impactCard: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: SPACING.large,
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  impactIcon: {
    fontSize: 32,
    marginRight: SPACING.medium,
  },
  impactIconComponent: {
    marginRight: SPACING.medium,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  impactSubtitle: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
  },
  impactValue: {
    alignItems: 'center',
    paddingTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  impactNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.small / 2,
  },
  impactLabel: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
});

export default ReportsScreen;
