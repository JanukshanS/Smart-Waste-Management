import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { RequestCard, RequestDetailsBottomSheet } from '../../components/Citizen';
import { citizenApi } from '../../api';
import { CITIZEN_ID } from '../../constants/devConfig';

const MyRequestsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // User ID imported from devConfig.js (will be from AuthContext after login implementation)
  const userId = CITIZEN_ID;

  const statuses = [
    { value: 'all', label: 'All', icon: '📋', color: COLORS.citizenPrimary },
    { value: 'pending', label: 'Pending', icon: '⏳', color: COLORS.citizenWarning },
    { value: 'approved', label: 'Approved', icon: '✓', color: COLORS.citizenInfo },
    { value: 'scheduled', label: 'Scheduled', icon: '📅', color: '#1976D2' },
    { value: 'in-progress', label: 'In Progress', icon: '🚛', color: '#F57C00' },
    { value: 'completed', label: 'Completed', icon: '✅', color: COLORS.citizenSuccess },
    { value: 'cancelled', label: 'Cancelled', icon: '❌', color: COLORS.citizenDanger },
  ];

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus, currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(currentPage === 1 && !refreshing);

      const response = await citizenApi.getMyRequests({
        userId,
        status: selectedStatus,
        page: currentPage,
        limit: 20,
      });

      if (response.success) {
        if (currentPage === 1) {
          setRequests(response.data);
        } else {
          setRequests((prev) => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchRequests();
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

  const handleRequestPress = async (request) => {
    try {
      setShowBottomSheet(true);
      setLoadingDetails(true);
      setSelectedRequest(null);

      // Fetch full request details
      const response = await citizenApi.getRequestById(request._id);

      if (response.success) {
        setSelectedRequest(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load request details');
        setShowBottomSheet(false);
      }
    } catch (error) {
      console.error('Fetch request details error:', error);
      Alert.alert('Error', 'Failed to load request details. Please try again.');
      setShowBottomSheet(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedRequest(null);
  };

  const handleRequestUpdate = (updatedRequest) => {
    // Update the request in the list
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req._id === updatedRequest._id ? updatedRequest : req
      )
    );
  };

  const renderRequestCard = ({ item }) => (
    <RequestCard request={item} onPress={handleRequestPress} />
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
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No Requests Found</Text>
        <Text style={styles.emptyText}>
          {selectedStatus === 'all'
            ? "You haven't created any waste collection requests yet."
            : `No ${selectedStatus} requests found.`}
        </Text>
        {selectedStatus === 'all' && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/citizen/create-request')}
          >
            <Text style={styles.createButtonText}>Create Your First Request</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <Text style={styles.subtitle}>
          {pagination ? `${pagination.total} total requests` : 'Loading...'}
        </Text>
      </View>

      {/* Horizontal Scrollable Status Filters */}
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

      {/* Results Count */}
      {!loading && pagination && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            Showing {requests.length} of {pagination.total} requests
            {currentPage > 1 && ` • Page ${currentPage}/${pagination.totalPages}`}
          </Text>
        </View>
      )}

      {/* Requests List */}
      {loading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.citizenPrimary} />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.citizenAccent]} tintColor={COLORS.citizenAccent} />
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
        onPress={() => router.push('/citizen/create-request')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Request Details Bottom Sheet */}
      <RequestDetailsBottomSheet
        visible={showBottomSheet}
        onClose={handleCloseBottomSheet}
        request={selectedRequest}
        loading={loadingDetails}
        onRequestUpdate={handleRequestUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.citizenBackground,
  },
  header: {
    backgroundColor: COLORS.citizenPrimary,
    padding: SPACING.large,
    paddingTop: SPACING.large + 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    opacity: 0.95,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.medium + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.citizenBorder,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.medium,
    gap: SPACING.small,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small + 2,
    paddingHorizontal: SPACING.medium,
    borderRadius: 24,
    backgroundColor: COLORS.citizenBackground,
    borderWidth: 2,
    borderColor: COLORS.citizenBorder,
    marginRight: SPACING.small,
  },
  filterChipSelected: {
    borderWidth: 2,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  filterChipIcon: {
    fontSize: 16,
    marginRight: SPACING.small / 2,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
  },
  filterChipTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  resultsInfo: {
    padding: SPACING.medium,
    paddingTop: SPACING.small + 2,
    paddingBottom: SPACING.small + 2,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.citizenBorder,
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
    fontWeight: '500',
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
    color: COLORS.citizenTextMedium,
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
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.medium,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.citizenBorder,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.medium,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: SPACING.small,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.citizenTextGray,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  createButton: {
    backgroundColor: COLORS.citizenAccent,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: SPACING.large,
    bottom: SPACING.large,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.citizenAccent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.white,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default MyRequestsScreen;
