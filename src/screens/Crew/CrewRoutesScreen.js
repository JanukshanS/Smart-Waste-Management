import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { crewApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const CrewRoutesScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState(null);

  const fetchRoutes = async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) return;

      const response = await crewApi.getMyRoutes(userId);
      if (response.success) {
        setRoutes(response.data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRoutes();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return '#2196F3';
      case 'in-progress':
        return COLORS.primary;
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return COLORS.textLight;
    }
  };

  const renderRouteCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/crew/route-details?id=${item._id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.routeCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.routeName}>{item.routeName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.scheduleText}>
            📅 {new Date(item.scheduledDate).toLocaleDateString()}
          </Text>
          
          {item.startTime && (
            <Text style={styles.timeText}>
              🕐 {item.startTime} - {item.endTime || 'TBD'}
            </Text>
          )}

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progress: {item.completedStops || 0}/{item.totalStops || 0} stops
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${item.completionPercentage || 0}%`,
                    backgroundColor: getStatusColor(item.status)
                  }
                ]} 
              />
            </View>
          </View>

          {item.coordinatorId && (
            <Text style={styles.coordinatorText}>
              👤 Coordinator: {item.coordinatorId.name}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading routes...</Text>
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
        <Text style={styles.title}>My Routes</Text>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchRoutes} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routes}
          renderItem={renderRouteCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyText}>No routes assigned</Text>
              <Text style={styles.emptySubtext}>Check back later for new assignments</Text>
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
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContent: {
    padding: SPACING.medium,
  },
  routeCard: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scheduleText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  progressContainer: {
    marginVertical: SPACING.small,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  coordinatorText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
  loadingText: {
    marginTop: SPACING.small,
    color: COLORS.textLight,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: SPACING.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyIcon: {
    fontSize: 64,
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

export default CrewRoutesScreen;
