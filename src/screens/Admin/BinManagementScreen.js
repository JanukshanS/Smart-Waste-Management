import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Trash2, 
  Search,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (error) {
    // Silently fail on New Architecture
  }
}
import { COLORS, SPACING } from '../../constants/theme';
import { BinCard, FilterChip, CreateBinBottomSheet } from '../../components/Admin';
import { adminApi } from '../../api';

const BinManagementScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bins, setBins] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBinType, setSelectedBinType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFillLevel, setSelectedFillLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const binTypes = ['all', 'general', 'recyclable', 'organic', 'hazardous'];
  const statuses = ['all', 'active', 'full', 'maintenance', 'inactive'];
  const fillLevels = [
    { label: 'All', value: 'all' },
    { label: 'Empty (<20%)', value: 'empty' },
    { label: 'Low (20-60%)', value: 'low' },
    { label: 'High (60-80%)', value: 'high' },
    { label: 'Full (>80%)', value: 'full' },
  ];

  useEffect(() => {
    fetchBins();
  }, [currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchBins();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBins = async () => {
    try {
      setLoading(currentPage === 1 && !refreshing);
      
      const response = await adminApi.getBins({
        page: currentPage,
        limit: 20,
      });

      if (response.success) {
        const fetchedBins = response.message || response.data || [];
        
        if (currentPage === 1) {
          setBins(fetchedBins);
        } else {
          setBins(prev => [...prev, ...fetchedBins]);
        }
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch bins');
      }
    } catch (error) {
      console.error('Fetch bins error:', error);
      Alert.alert('Error', 'Failed to load bins. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchBins();
  };

  const loadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleCreateBin = async (binData) => {
    try {
      const response = await adminApi.createBin(binData);
      if (response.success) {
        Alert.alert('Success', 'Bin created successfully!');
        setShowCreateModal(false);
        // Refresh the list
        setCurrentPage(1);
        onRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to create bin');
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Create bin error:', error);
      Alert.alert('Error', 'Failed to create bin. Please try again.');
      throw error;
    }
  };

  const handleBinPress = (bin) => {
    // Navigate to bin details using MongoDB _id
    router.push(`/admin/bin-details?id=${bin._id}`);
  };

  // Client-side filtering since API filtering is broken
  const getFilteredBins = () => {
    let filtered = [...bins];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bin =>
        bin.binId.toLowerCase().includes(query) ||
        bin.location.address.toLowerCase().includes(query) ||
        bin.location.area.toLowerCase().includes(query)
      );
    }

    // Bin type filter
    if (selectedBinType !== 'all') {
      filtered = filtered.filter(bin => bin.binType === selectedBinType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(bin => bin.status === selectedStatus);
    }

    // Fill level filter
    if (selectedFillLevel !== 'all') {
      filtered = filtered.filter(bin => {
        const fillLevel = bin.fillLevel;
        switch (selectedFillLevel) {
          case 'empty':
            return fillLevel < 20;
          case 'low':
            return fillLevel >= 20 && fillLevel < 60;
          case 'high':
            return fillLevel >= 60 && fillLevel < 80;
          case 'full':
            return fillLevel >= 80;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredBins = getFilteredBins();

  const clearFilters = () => {
    setSelectedBinType('all');
    setSelectedStatus('all');
    setSelectedFillLevel('all');
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedBinType !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (selectedFillLevel !== 'all') count++;
    if (searchQuery) count++;
    return count;
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersExpanded(!filtersExpanded);
  };

  const renderBinCard = ({ item }) => (
    <BinCard bin={item} onPress={() => handleBinPress(item)} />
  );

  const renderFooter = () => {
    if (!loading || currentPage === 1) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Trash2 size={64} color={COLORS.textLight} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>No Bins Found</Text>
        <Text style={styles.emptyText}>
          {searchQuery || getActiveFiltersCount() > 0
            ? 'Try adjusting your search or filters'
            : 'Create your first bin to get started'}
        </Text>
      </View>
    );
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Bin Management</Text>
          <Text style={styles.subtitle}>
            {pagination ? `${filteredBins.length} of ${bins.length} bins` : 'Loading...'}
          </Text>
        </View>
      </View>

      {/* Search & Filter Toggle */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by bin ID, address, or area..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle Button */}
        <TouchableOpacity 
          style={styles.filterToggleButton}
          onPress={toggleFilters}
          activeOpacity={0.7}
        >
          <View style={styles.filterToggleContent}>
            <Search size={16} color={COLORS.primary} style={styles.filterToggleIcon} />
            <Text style={styles.filterToggleText}>
              {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
            </Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
            {filtersExpanded ? (
              <ChevronUp size={20} color={COLORS.primary} />
            ) : (
              <ChevronDown size={20} color={COLORS.primary} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Collapsible Filters */}
      {filtersExpanded && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Bin Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Type:</Text>
              <View style={styles.filterChipsRow}>
                {binTypes.map((type) => (
                  <FilterChip
                    key={type}
                    label={type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    selected={selectedBinType === type}
                    onPress={() => setSelectedBinType(type)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterChipsRow}>
                {statuses.map((status) => (
                  <FilterChip
                    key={status}
                    label={status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    selected={selectedStatus === status}
                    onPress={() => setSelectedStatus(status)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Fill Level Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Fill Level:</Text>
              <View style={styles.filterChipsRow}>
                {fillLevels.map((level) => (
                  <FilterChip
                    key={level.value}
                    label={level.label}
                    selected={selectedFillLevel === level.value}
                    onPress={() => setSelectedFillLevel(level.value)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <X size={16} color={COLORS.white} />
              <Text style={styles.clearButtonText}>Clear All ({activeFiltersCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active Filters Summary (when collapsed) */}
      {!filtersExpanded && activeFiltersCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersList}>
            {selectedBinType !== 'all' && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>Type: {selectedBinType}</Text>
              </View>
            )}
            {selectedStatus !== 'all' && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>Status: {selectedStatus}</Text>
              </View>
            )}
            {selectedFillLevel !== 'all' && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>
                  {fillLevels.find(f => f.value === selectedFillLevel)?.label}
                </Text>
              </View>
            )}
            {searchQuery && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>
                  Search: "{searchQuery.substring(0, 15)}{searchQuery.length > 15 ? '...' : ''}"
                </Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity onPress={clearFilters} style={styles.clearAllButton}>
            <X size={16} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      )}

      {/* Bins List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading bins...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBins}
          renderItem={renderBinCard}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create Bin Bottom Sheet */}
      <CreateBinBottomSheet
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateBin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large + 20,
    paddingBottom: SPACING.large,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.white,
  },
  headerContent: {
    flex: 1,
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
  searchContainer: {
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  searchIcon: {
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 8,
  },
  filterToggleButton: {
    marginTop: SPACING.medium,
  },
  filterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterToggleIcon: {
    marginRight: SPACING.small,
  },
  filterToggleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.small,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.small,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  activeFiltersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activeFiltersLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.small,
  },
  activeFiltersList: {
    flex: 1,
  },
  activeFilterTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.small,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  activeFilterText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  clearAllButton: {
    padding: SPACING.small,
    marginLeft: SPACING.small,
  },
  listContent: {
    padding: SPACING.medium,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large * 2,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  loadingMore: {
    paddingVertical: SPACING.medium,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.large * 2,
    marginTop: SPACING.large * 2,
  },
  emptyIcon: {
    marginBottom: SPACING.medium,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.large,
    bottom: SPACING.large,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default BinManagementScreen;

