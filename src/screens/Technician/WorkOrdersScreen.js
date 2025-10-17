import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { WorkOrderCard } from '../../components/Technician';
import * as technicianApi from '../../api/technicianApi';

const WorkOrdersScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Status filters
  const statuses = [
    { value: 'all', label: 'All', icon: '', color: COLORS.primary },
    { value: 'pending', label: 'Pending', icon: '', color: COLORS.warning },
    { value: 'in-progress', label: 'In Progress', icon: '', color: '#1976D2' },
    { value: 'completed', label: 'Completed', icon: '', color: COLORS.success },
    { value: 'escalated', label: 'Escalated', icon: '', color: COLORS.danger },
  ];

  // Priority filters
  const priorities = [
    { value: 'all', label: 'All Priority', icon: '', color: COLORS.primary },
    { value: 'low', label: 'Low', icon: '', color: '#388E3C' },
    { value: 'medium', label: 'Medium', icon: '', color: '#F57C00' },
    { value: 'high', label: 'High', icon: '', color: '#C62828' },
  ];

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchWorkOrders();
    }, [selectedStatus, selectedPriority, currentPage])
  );

  useEffect(() => {
    fetchWorkOrders();
  }, [selectedStatus, selectedPriority, currentPage]);

  const fetchWorkOrders = async () => {
    try {
      setLoading(currentPage === 1 && !refreshing);

      const response = await technicianApi.getWorkOrders({
        status: selectedStatus,
        priority: selectedPriority,
        page: currentPage,
        limit: 20,
      });

      if (response.success) {
        if (currentPage === 1) {
          setWorkOrders(response.data);
        } else {
          setWorkOrders((prev) => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch work orders');
      }
    } catch (error) {
      console.error('Fetch work orders error:', error);
      Alert.alert('Error', 'Failed to load work orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchWorkOrders();
  };

  const loadMore = () => {
    if (pagination?.hasNextPage && !loading) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority);
    setCurrentPage(1);
  };

  const handleWorkOrderPress = (workOrder) => {
    router.push(`/technician/work-order-details?id=${workOrder._id}`);
  };

  const renderWorkOrderCard = ({ item }) => (
    <WorkOrderCard workOrder={item} onPress={handleWorkOrderPress} />
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
        <Text style={styles.emptyIcon}>🔧</Text>
        <Text style={styles.emptyTitle}>No Work Orders Found</Text>
        <Text style={styles.emptyText}>
          {selectedStatus === 'all' && selectedPriority === 'all'
            ? "You don't have any work orders assigned yet."
            : `No work orders found with the selected filters.`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Work Orders</Text>
        <Text style={styles.subtitle}>
          {pagination ? `${pagination.total} total work orders` : 'Loading...'}
        </Text>
      </View>

      {/* Status Filters */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statuses.map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.filterChip,
                selectedStatus === status.value && styles.filterChipSelected,
                selectedStatus === status.value && { 
                  backgroundColor: status.color,
                  borderColor: status.color 
                }
              ]}
              onPress={() => handleStatusFilter(status.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterChipIcon}>{status.icon}</Text>
              <Text style={[
                styles.filterChipText,
                selectedStatus === status.value && styles.filterChipTextSelected
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Priority Filters */}
      <View style={styles.prioritySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority.value}
              style={[
                styles.filterChip,
                selectedPriority === priority.value && styles.filterChipSelected,
                selectedPriority === priority.value && { 
                  backgroundColor: priority.color,
                  borderColor: priority.color 
                }
              ]}
              onPress={() => handlePriorityFilter(priority.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterChipIcon}>{priority.icon}</Text>
              <Text style={[
                styles.filterChipText,
                selectedPriority === priority.value && styles.filterChipTextSelected
              ]}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      {!loading && pagination && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            Showing {workOrders.length} of {pagination.total} work orders
            {currentPage > 1 && ` • Page ${currentPage}/${pagination.totalPages}`}
          </Text>
        </View>
      )}

      {/* Work Orders List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading work orders...</Text>
        </View>
      ) : (
        <FlatList
          data={workOrders}
          renderItem={renderWorkOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[COLORS.primary]} 
            />
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
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  prioritySection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.medium,
    gap: SPACING.small,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.small,
  },
  filterChipSelected: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: SPACING.small / 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterChipTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
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
});

export default WorkOrdersScreen;

