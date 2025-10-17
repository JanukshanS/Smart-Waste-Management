import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Chip, Searchbar, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { RequestCard } from '../../components/Coordinator';

const AllRequestsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });

  const fetchRequests = async () => {
    try {
      setError(null);
      // For now, we're fetching pending requests
      // In a real implementation, this would fetch all requests with status filtering
      const response = await coordinatorApi.getPendingRequests();
      if (response.success) {
        setRequests(response.data);
        calculateStats(response.data);
        applyFilter(response.data, activeFilter, searchQuery);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const calculateStats = (requestsData) => {
    const total = requestsData.length;
    const pending = requestsData.filter(r => r.status === 'pending').length;
    const approved = requestsData.filter(r => r.status === 'approved').length;
    const rejected = requestsData.filter(r => r.status === 'rejected').length;
    const completed = requestsData.filter(r => r.status === 'completed').length;
    
    setStats({ total, pending, approved, rejected, completed });
  };

  const applyFilter = (requestsData, filter, search) => {
    let filtered = [...requestsData];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(r => 
        r.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
        r.wasteType?.toLowerCase().includes(search.toLowerCase()) ||
        r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.address?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(requests, filter, searchQuery);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(requests, activeFilter, query);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleRequestPress = (request) => {
    router.push(`/coordinator/request-details?id=${request._id}`);
  };

  const renderRequest = ({ item }) => (
    <RequestCard 
      request={item} 
      onPress={() => handleRequestPress(item)}
      showActions={false}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Requests</Text>
        <Text style={styles.subtitle}>
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.error }]}>{stats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search requests..."
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
          All ({stats.total})
        </Chip>
        <Chip
          selected={activeFilter === 'pending'}
          onPress={() => handleFilterChange('pending')}
          style={styles.filterChip}
        >
          Pending ({stats.pending})
        </Chip>
        <Chip
          selected={activeFilter === 'approved'}
          onPress={() => handleFilterChange('approved')}
          style={styles.filterChip}
        >
          Approved ({stats.approved})
        </Chip>
        <Chip
          selected={activeFilter === 'rejected'}
          onPress={() => handleFilterChange('rejected')}
          style={styles.filterChip}
        >
          Rejected ({stats.rejected})
        </Chip>
        <Chip
          selected={activeFilter === 'completed'}
          onPress={() => handleFilterChange('completed')}
          style={styles.filterChip}
        >
          Completed ({stats.completed})
        </Chip>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item._id || item.trackingId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'all' 
                ? 'No requests in the system'
                : `No ${activeFilter} requests`}
            </Text>
          </View>
        }
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
  statsCard: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
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
});

export default AllRequestsScreen;

