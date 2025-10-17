import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SPACING } from '../../constants/theme';
import { citizenApi } from '../../api';

const TrackRequestScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTrackingData();
    }
  }, [id]);

  const fetchTrackingData = async (isRefreshing = false) => {
    if (!id) {
      Alert.alert('Error', 'No request ID provided');
      router.back();
      return;
    }

    isRefreshing ? setRefreshing(true) : setLoading(true);

    try {
      const response = await citizenApi.trackRequest(id);
      if (response.success) {
        setRequest(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch tracking data');
      }
    } catch (error) {
      console.error('Track request error:', error);
      Alert.alert('Error', 'Failed to fetch tracking data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTrackingData(true);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: COLORS.warning, bgColor: '#FFF3E0', icon: '⏳' };
      case 'approved':
        return { color: COLORS.info, bgColor: '#E3F2FD', icon: '✓' };
      case 'scheduled':
        return { color: '#1976D2', bgColor: '#E1F5FE', icon: '📅' };
      case 'in-progress':
        return { color: '#F57C00', bgColor: '#FFF3E0', icon: '🚛' };
      case 'completed':
        return { color: COLORS.success, bgColor: '#E8F5E9', icon: '✅' };
      case 'cancelled':
        return { color: COLORS.danger, bgColor: '#FFEBEE', icon: '❌' };
      default:
        return { color: COLORS.gray, bgColor: COLORS.background, icon: '?' };
    }
  };

  const getWasteTypeIcon = (wasteType) => {
    switch (wasteType) {
      case 'household': return '🏠';
      case 'recyclable': return '♻️';
      case 'organic': return '🌱';
      case 'electronic': return '📱';
      case 'hazardous': return '⚠️';
      default: return '🗑️';
    }
  };

  const getTimelineIcon = (iconName) => {
    switch (iconName) {
      case 'check': return '✓';
      case 'clock': return '⏰';
      case 'calendar': return '📅';
      case 'truck': return '🚛';
      case 'checkmark': return '✅';
      case 'close': return '❌';
      default: return '•';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No tracking data available</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const wasteTypeIcon = getWasteTypeIcon(request.wasteType);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.wasteTypeContainer}>
            <Text style={styles.wasteTypeIcon}>{wasteTypeIcon}</Text>
            <Text style={styles.wasteType}>{request.wasteType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.icon} {request.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.trackingId}>#{request.trackingId}</Text>

        <View style={styles.headerDetails}>
          <View style={styles.headerDetailItem}>
            <Text style={styles.headerDetailLabel}>Quantity</Text>
            <Text style={styles.headerDetailValue}>{request.quantity}</Text>
          </View>
          <View style={styles.headerDetailDivider} />
          <View style={styles.headerDetailItem}>
            <Text style={styles.headerDetailLabel}>Preferred Date</Text>
            <Text style={styles.headerDetailValue}>{formatDate(request.preferredDate)}</Text>
          </View>
        </View>
      </View>

      {/* Timeline Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📍 Request Timeline</Text>
        <View style={styles.timelineContainer}>
          {request.timeline && request.timeline.length > 0 ? (
            request.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIconContainer,
                      item.completed
                        ? styles.timelineIconCompleted
                        : styles.timelineIconPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineIconText,
                        item.completed
                          ? styles.timelineIconTextCompleted
                          : styles.timelineIconTextPending,
                      ]}
                    >
                      {getTimelineIcon(item.icon)}
                    </Text>
                  </View>
                  {index < request.timeline.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        item.completed
                          ? styles.timelineLineCompleted
                          : styles.timelineLinePending,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      item.completed && styles.timelineLabelCompleted,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.timelineDate}>{formatDateTime(item.date)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTimelineText}>No timeline data available</Text>
          )}
        </View>
      </View>

      {/* Map Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📍 Pickup Location</Text>
        <View style={styles.addressInfo}>
          <Text style={styles.addressText}>
            <Text style={styles.addressLabel}>Street: </Text>
            {request.address.street}
          </Text>
          <Text style={styles.addressText}>
            <Text style={styles.addressLabel}>City: </Text>
            {request.address.city}
          </Text>
          <Text style={styles.addressText}>
            <Text style={styles.addressLabel}>Coordinates: </Text>
            {request.address.coordinates.lat.toFixed(6)}, {request.address.coordinates.lng.toFixed(6)}
          </Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: request.address.coordinates.lat,
              longitude: request.address.coordinates.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={true}
            zoomEnabled={true}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: request.address.coordinates.lat,
                longitude: request.address.coordinates.lng,
              }}
              title="Pickup Location"
              description={`${request.address.street}, ${request.address.city}`}
              pinColor={COLORS.primary}
            />
          </MapView>
        </View>
      </View>

      {/* Requester Info Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👤 Requester Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{request.userId?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{request.userId?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{request.userId?.phone || 'N/A'}</Text>
        </View>
      </View>

      {/* Additional Details Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>📋 Additional Details</Text>
        {request.description && request.description.trim() !== '' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoValue}>{request.description}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estimated Cost:</Text>
          <Text style={styles.infoValue}>
            ${request.estimatedCost?.toFixed(2) || '0.00'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment Status:</Text>
          <Text style={[styles.infoValue, styles.paymentStatus]}>
            {request.paymentStatus || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created At:</Text>
          <Text style={styles.infoValue}>{formatDateTime(request.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated:</Text>
          <Text style={styles.infoValue}>{formatDateTime(request.updatedAt)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back to Requests</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.medium,
    paddingBottom: SPACING.large * 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  wasteTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wasteTypeIcon: {
    fontSize: 28,
    marginRight: SPACING.small,
  },
  wasteType: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small / 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  trackingId: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SPACING.medium,
  },
  headerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  headerDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerDetailLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.small / 2,
  },
  headerDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerDetailDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  timelineContainer: {
    paddingLeft: SPACING.small,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.small,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  timelineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  timelineIconCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timelineIconPending: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
  },
  timelineIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineIconTextCompleted: {
    color: COLORS.white,
  },
  timelineIconTextPending: {
    color: COLORS.textLight,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineLinePending: {
    backgroundColor: COLORS.border,
  },
  timelineRight: {
    flex: 1,
    paddingTop: SPACING.small / 2,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  timelineLabelCompleted: {
    color: COLORS.text,
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  noTimelineText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.medium,
  },
  addressInfo: {
    marginBottom: SPACING.medium,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.small / 2,
  },
  addressLabel: {
    fontWeight: '600',
    color: COLORS.textLight,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
    paddingVertical: SPACING.small / 2,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1.5,
    textAlign: 'right',
  },
  paymentStatus: {
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: SPACING.small,
  },
  refreshButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: COLORS.border,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TrackRequestScreen;
