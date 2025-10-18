import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Chip, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { BinStatsOverview, BinMapView, BinStatusCard } from '../../components/Coordinator';

const BinManagementScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'map', 'stats'

  const fetchBins = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getBins({ sort: 'fillLevel:desc' });
      if (response.success) {
        setBins(response.data);
        applyFilter(response.data, activeFilter);
      }
    } catch (err) {
      console.error('Error fetching bins:', err);
      setError('Failed to load bins');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBins();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBins, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  const applyFilter = (binsData, filter) => {
    let filtered = [...binsData];

    switch (filter) {
      case 'urgent':
        filtered = filtered.filter(b => b.fillLevel >= 90);
        break;
      case 'full':
        filtered = filtered.filter(b => b.fillLevel >= 90);
        break;
      case 'filling':
        filtered = filtered.filter(b => b.fillLevel >= 70 && b.fillLevel < 90);
        break;
      case 'normal':
        filtered = filtered.filter(b => b.fillLevel < 70);
        break;
      case 'offline':
        filtered = filtered.filter(b => b.status === 'offline');
        break;
      case 'maintenance':
        filtered = filtered.filter(b => b.status === 'maintenance');
        break;
      case 'active':
        filtered = filtered.filter(b => b.status === 'active');
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Sort by fill level (highest first) for urgent bins
    if (filter === 'urgent' || filter === 'full') {
      filtered.sort((a, b) => (b.fillLevel || 0) - (a.fillLevel || 0));
    }

    setFilteredBins(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(bins, filter);
  };

  const handleCategoryPress = (category) => {
    handleFilterChange(category);
    setViewMode('list');
  };

  const handleBinPress = (bin) => {
    router.push(`/coordinator/bin-details?id=${bin._id || bin.binId}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBins();
  };

  const getFilterCount = (filter) => {
    switch (filter) {
      case 'urgent':
      case 'full':
        return bins.filter(b => b.fillLevel >= 90).length;
      case 'filling':
        return bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 90).length;
      case 'normal':
        return bins.filter(b => b.fillLevel < 70).length;
      case 'offline':
        return bins.filter(b => b.status === 'offline').length;
      case 'maintenance':
        return bins.filter(b => b.status === 'maintenance').length;
      case 'active':
        return bins.filter(b => b.status === 'active').length;
      default:
        return bins.length;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bin management...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🗑️ Bin Management</Text>
        <Text style={styles.subtitle}>
          {`${filteredBins.length} of ${bins.length} bins`}
        </Text>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewModeContainer}>
        <Chip
          selected={viewMode === "stats"}
          onPress={() => setViewMode("stats")}
          style={styles.viewModeChip}
        >
          📊 Overview
        </Chip>
        <Chip
          selected={viewMode === "map"}
          onPress={() => setViewMode("map")}
          style={styles.viewModeChip}
        >
          🗺️ Map
        </Chip>
        <Chip
          selected={viewMode === "list"}
          onPress={() => setViewMode("list")}
          style={styles.viewModeChip}
        >
          📋 List
        </Chip>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Overview Mode */}
        {viewMode === "stats" && (
          <BinStatsOverview bins={bins} onCategoryPress={handleCategoryPress} />
        )}

        {/* Map View Mode */}
        {viewMode === "map" && (
          <>
            {/* Filter Chips for Map */}
            <View style={styles.filterContainer}>
              <Chip
                selected={activeFilter === "all"}
                onPress={() => handleFilterChange("all")}
                style={styles.filterChip}
              >
                All ({getFilterCount("all")})
              </Chip>
              <Chip
                selected={activeFilter === "urgent"}
                onPress={() => handleFilterChange("urgent")}
                style={styles.filterChip}
              >
                🚨 Urgent ({getFilterCount("urgent")})
              </Chip>
              <Chip
                selected={activeFilter === "filling"}
                onPress={() => handleFilterChange("filling")}
                style={styles.filterChip}
              >
                ⚠️ Filling ({getFilterCount("filling")})
              </Chip>
              <Chip
                selected={activeFilter === "normal"}
                onPress={() => handleFilterChange("normal")}
                style={styles.filterChip}
              >
                ✅ Normal ({getFilterCount("normal")})
              </Chip>
              <Chip
                selected={activeFilter === "offline"}
                onPress={() => handleFilterChange("offline")}
                style={styles.filterChip}
              >
                📴 Offline ({getFilterCount("offline")})
              </Chip>
            </View>

            {/* Enhanced Map View */}
            <BinMapView
              bins={filteredBins}
              onBinPress={handleBinPress}
              height={400}
              showControls={true}
              showLegend={true}
              filteredStatus={activeFilter !== "all" ? activeFilter : null}
            />
          </>
        )}

        {/* List View Mode */}
        {viewMode === "list" && (
          <>
            {/* Filter Chips */}
            <View style={styles.filterContainer}>
              <Chip
                selected={activeFilter === "all"}
                onPress={() => handleFilterChange("all")}
                style={styles.filterChip}
              >
                All ({getFilterCount("all")})
              </Chip>
              <Chip
                selected={activeFilter === "urgent"}
                onPress={() => handleFilterChange("urgent")}
                style={styles.filterChip}
              >
                🚨 Urgent ({getFilterCount("urgent")})
              </Chip>
              <Chip
                selected={activeFilter === "filling"}
                onPress={() => handleFilterChange("filling")}
                style={styles.filterChip}
              >
                ⚠️ Filling ({getFilterCount("filling")})
              </Chip>
              <Chip
                selected={activeFilter === "normal"}
                onPress={() => handleFilterChange("normal")}
                style={styles.filterChip}
              >
                ✅ Normal ({getFilterCount("normal")})
              </Chip>
              <Chip
                selected={activeFilter === "offline"}
                onPress={() => handleFilterChange("offline")}
                style={styles.filterChip}
              >
                📴 Offline ({getFilterCount("offline")})
              </Chip>
            </View>

            {/* Bins List */}
            <View style={styles.binsList}>
              {filteredBins.map((bin, index) => (
                <BinStatusCard
                  key={bin._id || bin.binId || index}
                  bin={bin}
                  onPress={handleBinPress}
                  showActions={true}
                />
              ))}

              {filteredBins.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No bins found</Text>
                  <Text style={styles.emptySubtext}>
                    {activeFilter === "all"
                      ? "No bins available in the system"
                      : `No bins match the ${activeFilter} filter`}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Bin"
        onPress={() => {
          // Future: Navigate to add bin screen
          console.log("Add new bin");
        }}
      />
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
  header: {
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    gap: SPACING.small,
  },
  viewModeChip: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.large,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    borderRadius: 12,
    marginBottom: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  filterChip: {
    marginBottom: SPACING.small,
  },
  binsList: {
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default BinManagementScreen;
