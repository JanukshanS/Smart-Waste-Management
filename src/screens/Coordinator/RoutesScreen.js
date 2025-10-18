import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Chip, Searchbar, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { RouteCard } from '../../components/Coordinator';

const RoutesScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchRoutes = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getRoutes();
      if (response.success) {
        setRoutes(response.data);
        applyFilter(response.data, activeFilter, searchQuery);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const applyFilter = (routesData, filter, search) => {
    let filtered = [...routesData];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(r => {
        const routeName = r.routeName?.toLowerCase() || '';
        const crewName = typeof r.crewId === 'object' ? (r.crewId.name?.toLowerCase() || '') : (r.crewId?.toLowerCase() || '');
        const vehicleId = r.vehicleId?.toLowerCase() || '';
        
        return routeName.includes(search.toLowerCase()) ||
               crewName.includes(search.toLowerCase()) ||
               vehicleId.includes(search.toLowerCase());
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRoutes(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(routes, filter, searchQuery);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(routes, activeFilter, query);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRoutes();
  };

  const handleRoutePress = (route) => {
    // Navigate to route details
    router.push(`/coordinator/route-details?id=${route._id}`);
  };

  const renderRoute = ({ item }) => (
    <RouteCard route={item} onPress={handleRoutePress} />
  );

  // Count routes by status
  const statusCounts = {
    all: routes.length,
    draft: routes.filter(r => r.status === 'draft').length,
    assigned: routes.filter(r => r.status === 'assigned').length,
    'in-progress': routes.filter(r => r.status === 'in-progress').length,
    completed: routes.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading routes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collection Routes</Text>
        <Text style={styles.subtitle}>
          {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search routes..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <Chip
          selected={activeFilter === 'all'}
          onPress={() => handleFilterChange('all')}
          style={styles.filterChip}
        >
          All ({statusCounts.all})
        </Chip>
        <Chip
          selected={activeFilter === 'draft'}
          onPress={() => handleFilterChange('draft')}
          style={styles.filterChip}
        >
          Draft ({statusCounts.draft})
        </Chip>
        <Chip
          selected={activeFilter === 'assigned'}
          onPress={() => handleFilterChange('assigned')}
          style={styles.filterChip}
        >
          Assigned ({statusCounts.assigned})
        </Chip>
        <Chip
          selected={activeFilter === 'in-progress'}
          onPress={() => handleFilterChange('in-progress')}
          style={styles.filterChip}
        >
          In Progress ({statusCounts['in-progress']})
        </Chip>
        <Chip
          selected={activeFilter === 'completed'}
          onPress={() => handleFilterChange('completed')}
          style={styles.filterChip}
        >
          Completed ({statusCounts.completed})
        </Chip>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Routes List */}
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
            <Text style={styles.emptyText}>No routes found</Text>
            <Text style={styles.emptySubtext}>
              Create a new route to get started
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Create Route"
        onPress={() => router.push('/coordinator/create-route')}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.large,
    paddingBottom: SPACING.small,
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
  searchBar: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.large,
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  filterChip: {
    marginBottom: SPACING.small,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    marginHorizontal: SPACING.large,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.large,
    paddingBottom: 100, // Extra padding for FAB
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

export default RoutesScreen;

