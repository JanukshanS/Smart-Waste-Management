import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Chip, Card, Searchbar, Menu, Button as PaperButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { BinCard } from '../../components/Coordinator';

const BinsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bins, setBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fillLevel');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

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

  const applyFilter = (binsData, filter, search, sort = sortBy, order = sortOrder) => {
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sort) {
        case 'fillLevel':
          aValue = a.fillLevel || 0;
          bValue = b.fillLevel || 0;
          break;
        case 'binId':
          aValue = a.binId || '';
          bValue = b.binId || '';
          break;
        case 'location':
          aValue = a.location?.area || a.location?.address || '';
          bValue = b.location?.area || b.location?.address || '';
          break;
        case 'lastCollection':
          aValue = new Date(a.lastCollection || 0).getTime();
          bValue = new Date(b.lastCollection || 0).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

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

  const handleSortChange = (newSort) => {
    if (newSort === sortBy) {
      // Toggle order
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      applyFilter(bins, activeFilter, searchQuery, sortBy, newOrder);
    } else {
      setSortBy(newSort);
      setSortOrder('desc'); // Default to descending for new sort
      applyFilter(bins, activeFilter, searchQuery, newSort, 'desc');
    }
    setSortMenuVisible(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBins();
  };

  const handleBinPress = (bin) => {
    router.push(`/coordinator/bin-details?id=${bin._id || bin.binId}`);
  };

  const renderBin = ({ item }) => (
    <BinCard bin={item} onPress={handleBinPress} />
  );

  const getSortLabel = () => {
    const labels = {
      fillLevel: 'Fill Level',
      binId: 'Bin ID',
      location: 'Location',
      lastCollection: 'Last Collection'
    };
    const orderIcon = sortOrder === 'asc' ? '↑' : '↓';
    return `Sort: ${labels[sortBy]} ${orderIcon}`;
  };

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

      {/* Search Bar and Sort Button Row */}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Search bins..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <PaperButton
              mode="outlined"
              onPress={() => setSortMenuVisible(true)}
              style={styles.sortButton}
              compact
            >
              {getSortLabel()}
            </PaperButton>
          }
        >
          <Menu.Item onPress={() => handleSortChange('fillLevel')} title="Fill Level" />
          <Menu.Item onPress={() => handleSortChange('binId')} title="Bin ID" />
          <Menu.Item onPress={() => handleSortChange('location')} title="Location" />
          <Menu.Item onPress={() => handleSortChange('lastCollection')} title="Last Collection" />
        </Menu>
      </View>

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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    gap: SPACING.small,
  },
  searchBar: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  sortButton: {
    borderColor: COLORS.primary,
    minWidth: 100,
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

