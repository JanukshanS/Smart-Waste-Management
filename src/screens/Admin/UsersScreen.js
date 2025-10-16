import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { UserCard, FilterChip } from '../../components/Admin';
import { adminApi } from '../../api';

const UsersScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  
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
        role: selectedRole,
        status: selectedStatus,
        search: searchQuery,
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>
          {pagination ? `${pagination.total} total users` : 'Loading...'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textLight}
        />
      </View>

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
  },
  filterSection: {
    padding: SPACING.medium,
    paddingBottom: SPACING.small,
    backgroundColor: COLORS.white,
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
    padding: SPACING.xl,
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
    padding: SPACING.xl,
    marginTop: SPACING.xl * 2,
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
});

export default UsersScreen;
