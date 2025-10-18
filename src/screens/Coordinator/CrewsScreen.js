import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';

const CrewsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [crews, setCrews] = useState([]);
  const [filteredCrews, setFilteredCrews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [error, setError] = useState(null);

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'unavailable', label: 'Unavailable' },
    { value: 'on-leave', label: 'On Leave' },
  ];

  useEffect(() => {
    fetchCrews();
  }, []);

  useEffect(() => {
    filterCrews();
  }, [searchQuery, selectedStatus, crews]);

  const fetchCrews = async () => {
    try {
      const response = await coordinatorApi.getCrews();
      if (response.success && response.data) {
        setCrews(response.data);
        setError(null);
      } else {
        console.error("Invalid response structure:", response);
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error('Error fetching crews:', err);
      setError('Failed to load crews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCrews = () => {
    let filtered = [...crews];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(
        (crew) => crew.availability === selectedStatus || crew.profile?.availability === selectedStatus
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (crew) =>
          crew.name?.toLowerCase().includes(query) ||
          crew.email?.toLowerCase().includes(query) ||
          crew.phone?.includes(query)
      );
    }

    setFilteredCrews(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCrews();
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available':
        return '#4CAF50';
      case 'assigned':
        return '#2196F3';
      case 'unavailable':
        return '#F44336';
      case 'on-leave':
        return '#FF9800';
      default:
        return COLORS.textLight;
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'available':
        return '✅';
      case 'assigned':
        return '🚛';
      case 'unavailable':
        return '❌';
      case 'on-leave':
        return '🏖️';
      default:
        return '❓';
    }
  };

  const renderCrewCard = ({ item }) => {
    const availability = item.availability || item.profile?.availability || 'available';
    const currentRoute = item.currentRoute;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/coordinator/crew-details?id=${item._id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.crewCard}>
          <Card.Content>
            <View style={styles.crewHeader}>
              <View style={styles.crewInfo}>
                <Text style={styles.crewName}>{item.name}</Text>
                <Text style={styles.crewContact}>{item.email}</Text>
                <Text style={styles.crewContact}>{item.phone}</Text>
              </View>
              <View style={styles.availabilityBadge}>
                <Text style={styles.availabilityIcon}>{getAvailabilityIcon(availability)}</Text>
                <Text
                  style={[styles.availabilityText, { color: getAvailabilityColor(availability) }]}
                >
                  {availability}
                </Text>
              </View>
            </View>

            {currentRoute && (
              <View style={styles.currentRouteSection}>
                <Text style={styles.currentRouteLabel}>Current Route:</Text>
                <Text style={styles.currentRouteName}>{currentRoute.routeName}</Text>
                <Text style={styles.currentRouteStatus}>{`Status: ${currentRoute.status}`}</Text>
              </View>
            )}

            {item.profile?.vehicleId && (
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>{`🚛 Vehicle: ${item.profile.vehicleId}`}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading crews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crew Management</Text>
        <TouchableOpacity
          onPress={() => router.push('/coordinator/create-crew')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Filters */}
      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedStatus === item.value && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Crews List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCrews}
          renderItem={renderCrewCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No crews found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters or add a new crew member</Text>
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
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  searchSection: {
    padding: SPACING.large,
    paddingBottom: SPACING.small,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtersSection: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.medium,
  },
  filterButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.large,
  },
  crewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  crewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  crewInfo: {
    flex: 1,
  },
  crewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  crewContact: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  availabilityBadge: {
    alignItems: 'center',
  },
  availabilityIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  currentRouteSection: {
    marginTop: SPACING.medium,
    padding: SPACING.small,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  currentRouteLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  currentRouteName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  currentRouteStatus: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  vehicleInfo: {
    marginTop: SPACING.small,
  },
  vehicleLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  errorContainer: {
    padding: SPACING.large,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.medium,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default CrewsScreen;

