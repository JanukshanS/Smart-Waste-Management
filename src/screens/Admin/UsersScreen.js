import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TextInput, Alert, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { UserCard, FilterChip, CreateUserBottomSheet } from '../../components/Admin';
import { adminApi } from '../../api';

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

const UsersScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filters
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const roles = ['all', 'admin', 'citizen', 'coordinator', 'technician'];
  const statuses = ['all', 'active', 'inactive', 'suspended'];

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus, currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(currentPage === 1 && !refreshing);
      
      const response = await adminApi.getUsers({
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      });

      if (response.success) {
        if (currentPage === 1) {
          setUsers(response.data);
        } else {
          setUsers(prev => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchUsers();
  };

  const loadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleUserPress = (user) => {
    router.push(`/admin/user-details?id=${user._id}`);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersExpanded(!filtersExpanded);
  };

  const clearFilters = () => {
    setSelectedRole('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedRole !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (searchQuery) count++;
    return count;
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await adminApi.createUser(userData);
      if (response.success) {
        Alert.alert('Success', 'User created successfully!');
        setShowCreateModal(false);
        // Refresh the list
        setCurrentPage(1);
        onRefresh();
      } else {
        Alert.alert('Error', response.message || 'Failed to create user');
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Create user error:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
      throw error;
    }
  };

  const renderUserCard = ({ item }) => (
    <UserCard user={item} onPress={() => handleUserPress(item)} />
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
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No Users Found</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Try adjusting your search or filters' : 'No users match the selected filters'}
        </Text>
      </View>
    );
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>
          {pagination ? `${pagination.total} total users` : 'Loading...'}
        </Text>
      </View>

      {/* Search Bar & Filter Toggle */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textLight}
        />
        
        <View style={styles.filterToggleRow}>
          <TouchableOpacity 
            style={styles.filterToggleButton} 
            onPress={toggleFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>🔍</Text>
            <Text style={styles.filterToggleText}>
              {filtersExpanded ? 'Hide Filters' : 'Show Filters'}
            </Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
            <Text style={[styles.filterArrow, filtersExpanded && styles.filterArrowExpanded]}>
              ›
            </Text>
          </TouchableOpacity>

          {activeFiltersCount > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Collapsible Filters */}
      {filtersExpanded && (
        <View style={styles.filtersContainer}>
          {/* Role Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Role:</Text>
            <View style={styles.filterChipsContainer}>
              {roles.map((role) => (
                <FilterChip
                  key={role}
                  label={role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                  selected={selectedRole === role}
                  onPress={() => handleRoleFilter(role)}
                />
              ))}
            </View>
          </View>

          {/* Status Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterChipsContainer}>
              {statuses.map((status) => (
                <FilterChip
                  key={status}
                  label={status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  selected={selectedStatus === status}
                  onPress={() => handleStatusFilter(status)}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Active Filters Display (when collapsed) */}
      {!filtersExpanded && activeFiltersCount > 0 && (
        <View style={styles.activeFiltersBar}>
          {selectedRole !== 'all' && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterTagText}>
                Role: {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Text>
            </View>
          )}
          {selectedStatus !== 'all' && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterTagText}>
                Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              </Text>
            </View>
          )}
          {searchQuery && (
            <View style={styles.activeFilterTag}>
              <Text style={styles.activeFilterTagText}>
                Search: "{searchQuery.substring(0, 15)}{searchQuery.length > 15 ? '...' : ''}"
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Results Count */}
      {!loading && pagination && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            Showing {users.length} of {pagination.total} users
            {currentPage > 1 && ` • Page ${currentPage}/${pagination.totalPages}`}
          </Text>
        </View>
      )}

      {/* Users List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item._id}
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

      {/* Create User Bottom Sheet */}
      <CreateUserBottomSheet
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateUser}
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
  searchContainer: {
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  filterToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    flex: 1,
    marginRight: SPACING.small,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: SPACING.small / 2,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
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
  filterArrow: {
    fontSize: 24,
    color: COLORS.textLight,
    transform: [{ rotate: '90deg' }],
  },
  filterArrowExpanded: {
    transform: [{ rotate: '-90deg' }],
  },
  clearButton: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.small,
    paddingHorizontal: SPACING.medium,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.small,
  },
  activeFilterTag: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: SPACING.small,
    borderRadius: 12,
  },
  activeFilterTagText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  resultsInfo: {
    padding: SPACING.medium,
    paddingTop: SPACING.small,
    paddingBottom: SPACING.small,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  listContent: {
    padding: SPACING.medium,
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
    fontSize: 64,
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

export default UsersScreen;
