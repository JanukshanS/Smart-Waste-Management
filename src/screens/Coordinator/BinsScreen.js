import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Chip, Card, Searchbar } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { BinCard } from '../../components/Coordinator';

const BinsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    full: 0,
    filling: 0,
    normal: 0,
  });

  const fetchBins = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getBins({ sort: 'fillLevel:desc' });
      if (response.success) {
        setBins(response.data);
        calculateStats(response.data);
        applyFilter(response.data, activeFilter, searchQuery);
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

  const calculateStats = (binsData) => {
    const total = binsData.length;
    const full = binsData.filter(b => b.fillLevel >= 90).length;
    const filling = binsData.filter(b => b.fillLevel >= 70 && b.fillLevel < 90).length;
    const normal = binsData.filter(b => b.fillLevel < 70).length;
    
    setStats({ total, full, filling, normal });
  };

  const applyFilter = (binsData, filter, search) => {
    let filtered = [...binsData];

    // Apply filter
    if (filter === 'full') {
      filtered = filtered.filter(b => b.fillLevel >= 90);
    } else if (filter === 'filling') {
      filtered = filtered.filter(b => b.fillLevel >= 70 && b.fillLevel < 90);
    } else if (filter === 'active') {
      filtered = filtered.filter(b => b.status === 'active');
    }

    // Apply search
    if (search) {
      filtered = filtered.filter(b => 
        b.binId?.toLowerCase().includes(search.toLowerCase()) ||
        b.location?.address?.toLowerCase().includes(search.toLowerCase()) ||
        b.location?.area?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredBins(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilter(bins, filter, searchQuery);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(bins, activeFilter, query);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBins();
  };

  const renderBin = ({ item }) => (
    <BinCard bin={item} onPress={(bin) => console.log('Bin pressed:', bin.binId)} />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bins...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Bins</Text>
        <Text style={styles.subtitle}>Monitor bin fill levels</Text>
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
              <Text style={[styles.statValue, { color: COLORS.error }]}>{stats.full}</Text>
              <Text style={styles.statLabel}>Full</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFA500' }]}>{stats.filling}</Text>
              <Text style={styles.statLabel}>Filling</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.normal}</Text>
              <Text style={styles.statLabel}>Normal</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search bins..."
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
          All Bins
        </Chip>
        <Chip
          selected={activeFilter === 'full'}
          onPress={() => handleFilterChange('full')}
          style={styles.filterChip}
        >
          Full (≥90%)
        </Chip>
        <Chip
          selected={activeFilter === 'filling'}
          onPress={() => handleFilterChange('filling')}
          style={styles.filterChip}
        >
          Filling (70-89%)
        </Chip>
        <Chip
          selected={activeFilter === 'active'}
          onPress={() => handleFilterChange('active')}
          style={styles.filterChip}
        >
          Active
        </Chip>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Bins List */}
      <FlatList
        data={filteredBins}
        renderItem={renderBin}
        keyExtractor={(item) => item._id || item.binId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bins found</Text>
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
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default BinsScreen;

