import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { InteractiveMap } from "../../components/Coordinator";

const CollectionHistoryScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'

  const fetchCollectionHistory = async () => {
    try {
      setError(null);
      // Fetch completed routes
      const response = await coordinatorApi.getRoutes({ status: "completed" });
      if (response.success) {
        setRoutes(response.data);
        applyFilter(response.data, selectedTimeRange, searchQuery);
      }
    } catch (err) {
      console.error("Error fetching collection history:", err);
      setError("Failed to load collection history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCollectionHistory();
  }, []);

  const applyFilter = (routesData, timeRange, search) => {
    let filtered = [...routesData];

    // Apply time range filter
    const now = new Date();
    if (timeRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(
        (r) => new Date(r.completedAt || r.updatedAt) >= weekAgo
      );
    } else if (timeRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(
        (r) => new Date(r.completedAt || r.updatedAt) >= monthAgo
      );
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.routeName?.toLowerCase().includes(search.toLowerCase()) ||
          r.crewId?.toLowerCase().includes(search.toLowerCase()) ||
          r.vehicleId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by completion date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.updatedAt);
      const dateB = new Date(b.completedAt || b.updatedAt);
      return dateB - dateA;
    });

    setFilteredRoutes(filtered);
  };

  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);
    applyFilter(routes, timeRange, searchQuery);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(routes, selectedTimeRange, query);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCollectionHistory();
  };

  const handleRoutePress = (route) => {
    router.push(`/coordinator/route-details?id=${route._id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRoute = ({ item }) => (
    <Card style={styles.routeCard} onPress={() => handleRoutePress(item)}>
      <Card.Content>
        <View style={styles.routeHeader}>
          <Text style={styles.routeName}>{item.routeName}</Text>
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>
              {item.completionPercentage || 100}% Complete
            </Text>
          </View>
        </View>

        <View style={styles.routeInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Completed:</Text>
            <Text style={styles.infoValue}>
              {formatDate(item.completedAt || item.updatedAt)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Crew:</Text>
            <Text style={styles.infoValue}>
              {item.crewId || "Not assigned"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle:</Text>
            <Text style={styles.infoValue}>
              {item.vehicleId || "Not assigned"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Stops Completed:</Text>
            <Text style={styles.infoValue}>
              {item.stops?.filter((s) => s.status === "completed").length || 0}{" "}
              / {item.stops?.length || 0}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance:</Text>
            <Text style={styles.infoValue}>
              {item.totalDistance
                ? `${item.totalDistance.toFixed(1)} km`
                : "N/A"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>
              {item.estimatedDuration ? `${item.estimatedDuration} min` : "N/A"}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading collection history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collection History</Text>
        <Text style={styles.subtitle}>
          {filteredRoutes.length} completed route
          {filteredRoutes.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search routes..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Time Range Filter */}
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedTimeRange === "all"}
          onPress={() => handleTimeRangeChange("all")}
          style={styles.filterChip}
        >
          All Time
        </Chip>
        <Chip
          selected={selectedTimeRange === "week"}
          onPress={() => handleTimeRangeChange("week")}
          style={styles.filterChip}
        >
          Last Week
        </Chip>
        <Chip
          selected={selectedTimeRange === "month"}
          onPress={() => handleTimeRangeChange("month")}
          style={styles.filterChip}
        >
          Last Month
        </Chip>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <Chip
          selected={viewMode === "list"}
          onPress={() => setViewMode("list")}
          style={styles.viewModeChip}
        >
          📋 List View
        </Chip>
        <Chip
          selected={viewMode === "map"}
          onPress={() => setViewMode("map")}
          style={styles.viewModeChip}
        >
          🗺️ Map View
        </Chip>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <Card style={styles.mapCard}>
          <Card.Content>
            <Text style={styles.mapTitle}>Collection Routes History</Text>
            <Text style={styles.mapSubtitle}>
              {filteredRoutes.length} completed route
              {filteredRoutes.length !== 1 ? "s" : ""}
            </Text>
            <InteractiveMap
              bins={[]} // No bins for history view
              routes={filteredRoutes}
              showBins={false}
              showRoutes={true}
              showControls={true}
              showLegend={true}
              height={400}
              style={styles.historyMap}
            />
          </Card.Content>
        </Card>
      )}

      {/* Routes List */}
      {viewMode === "list" && (
        <FlatList
          data={filteredRoutes}
          renderItem={renderRoute}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No collection history</Text>
              <Text style={styles.emptySubtext}>
                Completed routes will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.large,
    paddingBottom: SPACING.small,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
  searchBar: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.large,
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  filterChip: {
    marginBottom: SPACING.small,
  },
  viewModeContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.large,
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  viewModeChip: {
    flex: 1,
  },
  mapCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.medium,
  },
  historyMap: {
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: SPACING.medium,
    marginHorizontal: SPACING.large,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  listContent: {
    padding: SPACING.large,
  },
  emptyContainer: {
    padding: SPACING.large,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
  routeCard: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
  },
  completionBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small / 2,
    borderRadius: 12,
  },
  completionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  routeInfo: {
    gap: SPACING.small,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default CollectionHistoryScreen;

