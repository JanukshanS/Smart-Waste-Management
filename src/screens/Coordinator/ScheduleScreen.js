import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';

const ScheduleScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('today');

  const fetchScheduledRoutes = async () => {
    try {
      setError(null);
      // Fetch routes with assigned or in-progress status
      const response = await coordinatorApi.getRoutes();
      if (response.success) {
        setRoutes(response.data);
        applyDateFilter(response.data, selectedView);
      }
    } catch (err) {
      console.error('Error fetching scheduled routes:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduledRoutes();
  }, []);

  const applyDateFilter = (routesData, view) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filtered = routesData.filter(r => 
      r.status === 'assigned' || r.status === 'in-progress' || r.status === 'draft'
    );

    if (view === 'today') {
      filtered = filtered.filter(r => {
        if (!r.scheduledDate) return false;
        const routeDate = new Date(r.scheduledDate);
        return routeDate.toDateString() === today.toDateString();
      });
    } else if (view === 'week') {
      const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => {
        if (!r.scheduledDate) return false;
        const routeDate = new Date(r.scheduledDate);
        return routeDate >= today && routeDate <= weekLater;
      });
    } else if (view === 'upcoming') {
      filtered = filtered.filter(r => {
        if (!r.scheduledDate) return true; // Include unscheduled routes
        const routeDate = new Date(r.scheduledDate);
        return routeDate >= today;
      });
    }

    // Sort by scheduled date
    filtered.sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
      const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
      return dateA - dateB;
    });

    setFilteredRoutes(filtered);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
    applyDateFilter(routes, view);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchScheduledRoutes();
  };

  const handleRoutePress = (route) => {
    router.push(`/coordinator/route-details?id=${route._id}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return '#757575';
      case 'assigned':
        return COLORS.primary;
      case 'in-progress':
        return '#FFA500';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRoute = ({ item }) => (
    <Card style={styles.routeCard} onPress={() => handleRoutePress(item)}>
      <Card.Content>
        <View style={styles.routeHeader}>
          <View style={styles.routeHeaderLeft}>
            <Text style={styles.routeName}>{item.routeName}</Text>
            <Text style={styles.routeDate}>
              {formatDate(item.scheduledDate)} {formatTime(item.scheduledDate)}
            </Text>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {item.status?.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Crew:</Text>
            <Text style={styles.detailValue}>{item.crewId || 'Not assigned'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle:</Text>
            <Text style={styles.detailValue}>{item.vehicleId || 'Not assigned'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stops:</Text>
            <Text style={styles.detailValue}>{item.stops?.length || 0} stops</Text>
          </View>
          {item.status === 'in-progress' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Progress:</Text>
              <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: 'bold' }]}>
                {item.completionPercentage || 0}%
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collection Schedule</Text>
        <Text style={styles.subtitle}>
          {filteredRoutes.length} scheduled route{filteredRoutes.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* View Selector */}
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedView === 'today'}
          onPress={() => handleViewChange('today')}
          style={styles.filterChip}
        >
          Today
        </Chip>
        <Chip
          selected={selectedView === 'week'}
          onPress={() => handleViewChange('week')}
          style={styles.filterChip}
        >
          This Week
        </Chip>
        <Chip
          selected={selectedView === 'upcoming'}
          onPress={() => handleViewChange('upcoming')}
          style={styles.filterChip}
        >
          Upcoming
        </Chip>
        <Chip
          selected={selectedView === 'all'}
          onPress={() => handleViewChange('all')}
          style={styles.filterChip}
        >
          All
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
            <Text style={styles.emptyText}>No scheduled routes</Text>
            <Text style={styles.emptySubtext}>
              {selectedView === 'today' 
                ? 'No routes scheduled for today'
                : `No routes in ${selectedView} view`}
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
  routeCard: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  routeHeaderLeft: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  routeDate: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusChip: {
    marginLeft: SPACING.small,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  routeDetails: {
    gap: SPACING.small,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default ScheduleScreen;

