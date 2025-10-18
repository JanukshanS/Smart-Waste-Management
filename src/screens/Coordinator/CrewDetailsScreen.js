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
import { coordinatorApi } from '../../api';

const CrewDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [crew, setCrewDetails] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCrewDetails();
  }, [id]);

  const fetchCrewDetails = async () => {
    try {
      const response = await coordinatorApi.getCrewDetails(id);
      if (response.success) {
        setCrewDetails(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching crew details:', err);
      setError('Failed to load crew details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (newAvailability) => {
    Alert.alert(
      'Update Availability',
      `Change crew status to ${newAvailability}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setUpdating(true);
              const response = await coordinatorApi.updateCrewAvailability(id, newAvailability);
              
              if (response.success) {
                Alert.alert('Success', 'Crew availability updated successfully');
                fetchCrewDetails();
              }
            } catch (err) {
              console.error('Error updating availability:', err);
              Alert.alert('Error', 'Failed to update availability');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading crew details...</Text>
      </View>
    );
  }

  if (error || !crew) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Crew not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCrewDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const crewData = crew.crew || crew;
  const profile = crew.profile;
  const currentRoute = crew.currentRoute;
  const routeHistory = crew.routeHistory || [];
  const availability = profile?.availability || 'available';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.crewName}>{crewData.name}</Text>
            <Text style={styles.crewRole}>Crew Member</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getAvailabilityColor(availability) }]}>
            <Text style={styles.statusIcon}>{getAvailabilityIcon(availability)}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Contact Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📧 Email:</Text>
              <Text style={styles.infoValue}>{crewData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Phone:</Text>
              <Text style={styles.infoValue}>{crewData.phone}</Text>
            </View>
            {crewData.address && (crewData.address.street || crewData.address.city) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Address:</Text>
                <Text style={styles.infoValue}>
                  {[crewData.address.street, crewData.address.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Work Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Work Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: getAvailabilityColor(availability) }]}>
                {availability}
              </Text>
            </View>
            {profile?.vehicleId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🚛 Vehicle:</Text>
                <Text style={styles.infoValue}>{profile.vehicleId}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>
                {new Date(crewData.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Current Route */}
        {currentRoute && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>🚛 Current Route</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{currentRoute.routeName}</Text>
                <Text style={styles.routeDetail}>
                  {`Status: ${currentRoute.status}`}
                </Text>
                <Text style={styles.routeDetail}>
                  {`Scheduled: ${new Date(currentRoute.scheduledDate).toLocaleDateString()}`}
                </Text>
                {currentRoute.coordinatorId && (
                  <Text style={styles.routeDetail}>
                    Coordinator: {currentRoute.coordinatorId.name}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Route History */}
        {routeHistory.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>📜 Route History</Text>
              {routeHistory.map((route, index) => (
                <View key={route._id || `route-${index}`} style={styles.historyItem}>
                  <Text style={styles.historyRouteName}>{route.routeName}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(route.completedAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.historyDetail}>
                    Distance: {(route.totalDistance || 0).toFixed(1)} km
                  </Text>
                  <Text style={styles.historyDetail}>
                    Completion: {route.completionPercentage || 0}%
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Update Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Availability</Text>
          <View style={styles.availabilityButtons}>
            <TouchableOpacity
              style={[
                styles.availabilityButton,
                { backgroundColor: '#4CAF50' },
                availability === 'available' && styles.availabilityButtonActive,
              ]}
              onPress={() => handleUpdateAvailability('available')}
              disabled={updating || availability === 'available'}
            >
              <Text style={styles.availabilityButtonText}>✅ Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.availabilityButton,
                { backgroundColor: '#F44336' },
                availability === 'unavailable' && styles.availabilityButtonActive,
              ]}
              onPress={() => handleUpdateAvailability('unavailable')}
              disabled={updating || availability === 'unavailable'}
            >
              <Text style={styles.availabilityButtonText}>❌ Unavailable</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.availabilityButton,
                { backgroundColor: '#FF9800' },
                availability === 'on-leave' && styles.availabilityButtonActive,
              ]}
              onPress={() => handleUpdateAvailability('on-leave')}
              disabled={updating || availability === 'on-leave'}
            >
              <Text style={styles.availabilityButtonText}>🏖️ On Leave</Text>
            </TouchableOpacity>
          </View>
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
  crewName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  crewRole: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.small,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    fontWeight: '500',
  },
  routeInfo: {
    padding: SPACING.small,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  routeDetail: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  routeStatusText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  historyItem: {
    padding: SPACING.medium,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: SPACING.small,
  },
  historyRouteName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.small,
  },
  historyDetail: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  section: {
    padding: SPACING.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  availabilityButtons: {
    gap: SPACING.medium,
  },
  availabilityButton: {
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  availabilityButtonActive: {
    opacity: 0.5,
  },
  availabilityButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrewDetailsScreen;

