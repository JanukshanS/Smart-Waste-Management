import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { crewApi } from '../../api';

const CrewRouteDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await crewApi.getRouteDetails(id);
      if (response.success) {
        setRoute(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching route details:', err);
      setError('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStopStatus = async (stopIndex, status) => {
    try {
      const response = await crewApi.updateStopStatus(id, stopIndex, { status });
      
      if (response.success) {
        Alert.alert('Success', `Stop marked as ${status}`);
        fetchRouteDetails();
      }
    } catch (err) {
      console.error('Error updating stop status:', err);
      Alert.alert('Error', 'Failed to update stop status');
    }
  };

  const confirmStopAction = (stopIndex, status, stopName) => {
    Alert.alert(
      'Confirm Action',
      `Mark "${stopName}" as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => handleUpdateStopStatus(stopIndex, status),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading route details...</Text>
      </View>
    );
  }

  if (error || !route) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Route not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRouteDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStopStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'skipped':
        return '#FFA500';
      case 'pending':
      default:
        return COLORS.textLight;
    }
  };

  const getStopStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'skipped':
        return '⏭️';
      case 'pending':
      default:
        return '⏳';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Route Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.routeName}>{route.routeName}</Text>
            <Text style={styles.routeDate}>
              {new Date(route.scheduledDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.statusBadgeText}>{route.status}</Text>
          </View>
        </View>

        {/* Progress Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Route Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${route.completionPercentage || 0}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {route.completionPercentage || 0}% Complete
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {route.stops?.filter((s) => s.status === 'completed').length || 0}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{route.stops?.length || 0}</Text>
                <Text style={styles.statLabel}>Total Stops</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {(route.totalDistance || 0).toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Stops List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Stops</Text>
          {route.stops && route.stops.length > 0 ? (
            route.stops.map((stop, index) => (
              <Card key={index} style={styles.stopCard}>
                <Card.Content>
                  <View style={styles.stopHeader}>
                    <View style={styles.stopNumberContainer}>
                      <Text style={styles.stopNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.stopInfo}>
                      <Text style={styles.stopType}>{stop.type || 'Bin Collection'}</Text>
                      {stop.binId && (
                        <Text style={styles.stopDetail}>Bin: {stop.binId}</Text>
                      )}
                      {stop.requestId && (
                        <Text style={styles.stopDetail}>Request: {stop.requestId}</Text>
                      )}
                      {stop.location && (
                        <Text style={styles.stopAddress}>
                          📍 {stop.location.address || 'Location available'}
                        </Text>
                      )}
                    </View>
                    <View style={styles.stopStatus}>
                      <Text style={styles.stopStatusIcon}>
                        {getStopStatusIcon(stop.status)}
                      </Text>
                      <Text
                        style={[
                          styles.stopStatusText,
                          { color: getStopStatusColor(stop.status) },
                        ]}
                      >
                        {stop.status || 'pending'}
                      </Text>
                    </View>
                  </View>

                  {stop.status === 'pending' && (
                    <View style={styles.stopActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() =>
                          confirmStopAction(
                            index,
                            'completed',
                            stop.binId || `Stop ${index + 1}`
                          )
                        }
                      >
                        <Text style={styles.actionButtonText}>Mark Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.skipButton]}
                        onPress={() =>
                          confirmStopAction(
                            index,
                            'skipped',
                            stop.binId || `Stop ${index + 1}`
                          )
                        }
                      >
                        <Text style={styles.actionButtonText}>Skip</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {stop.completedAt && (
                    <Text style={styles.completedTime}>
                      Completed: {new Date(stop.completedAt).toLocaleTimeString()}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={styles.noStopsText}>No stops in this route</Text>
          )}
        </View>

        {/* Report Issue Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push('/crew/report-issue')}
          >
            <Text style={styles.reportButtonText}>⚠️ Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerContent: {
    flex: 1,
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  routeDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: SPACING.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    margin: SPACING.large,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.small,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  stopCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  stopNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  stopNumber: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopInfo: {
    flex: 1,
  },
  stopType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  stopDetail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  stopAddress: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  stopStatus: {
    alignItems: 'center',
  },
  stopStatusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  stopStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stopActions: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  actionButton: {
    flex: 1,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  skipButton: {
    backgroundColor: '#FFA500',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  completedTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
  noStopsText: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: 14,
    marginVertical: SPACING.large,
  },
  reportButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrewRouteDetailsScreen;

