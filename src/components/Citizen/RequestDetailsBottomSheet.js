import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SPACING } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RequestDetailsBottomSheet = ({ visible, onClose, request, loading }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!request && !loading) return null;

  const wasteTypeIcons = {
    household: '🏠',
    recyclable: '♻️',
    organic: '🌱',
    electronic: '📱',
    hazardous: '⚠️',
  };

  const statusColors = {
    pending: { bg: COLORS.warningBg, text: COLORS.warningText, label: 'Pending' },
    approved: { bg: COLORS.infoBg, text: COLORS.info, label: 'Approved' },
    scheduled: { bg: '#E3F2FD', text: '#1976D2', label: 'Scheduled' },
    'in-progress': { bg: '#FFF3E0', text: '#F57C00', label: 'In Progress' },
    completed: { bg: '#E8F5E9', text: '#388E3C', label: 'Completed' },
    cancelled: { bg: COLORS.dangerBg, text: COLORS.dangerText, label: 'Cancelled' },
  };

  const statusConfig = request ? statusColors[request.status] || statusColors.pending : statusColors.pending;
  const icon = request ? wasteTypeIcons[request.wasteType] || '📦' : '📦';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTrackRequest = () => {
    onClose();
    if (request?._id) {
      router.push(`/citizen/track-request?id=${request._id}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View 
          style={[styles.backdrop, { opacity: fadeAnim }]}
        >
          <TouchableOpacity 
            style={styles.backdropTouch} 
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading details...</Text>
              </View>
            ) : request ? (
              <>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.icon}>{icon}</Text>
                    <View>
                      <Text style={styles.wasteType}>{request.wasteType}</Text>
                      <Text style={styles.trackingId}>#{request.trackingId}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* User Information */}
                {request.userId && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👤 Requester Information</Text>
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name:</Text>
                        <Text style={styles.infoValue}>{request.userId.name}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{request.userId.email}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoValue}>{request.userId.phone}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Request Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📋 Request Details</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Waste Type:</Text>
                      <Text style={styles.infoValue}>{request.wasteType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Quantity:</Text>
                      <Text style={styles.infoValue}>{request.quantity}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Preferred Date:</Text>
                      <Text style={styles.infoValue}>{formatDate(request.preferredDate)}</Text>
                    </View>
                    {request.description && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Description:</Text>
                        <Text style={styles.infoValue}>{request.description}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Address Information with Map */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📍 Pickup Address</Text>
                  
                  {/* Address Text */}
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Street:</Text>
                      <Text style={styles.infoValue}>{request.address.street}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>City:</Text>
                      <Text style={styles.infoValue}>{request.address.city}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Coordinates:</Text>
                      <Text style={styles.infoValue}>
                        {request.address.coordinates.lat.toFixed(6)}, {request.address.coordinates.lng.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  {/* Map View */}
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
                    <View style={styles.mapOverlay}>
                      <Text style={styles.mapOverlayText}>
                        📍 Tap to interact with map
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💰 Payment Details</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Estimated Cost:</Text>
                      <Text style={styles.infoValue}>
                        Rs. {request.estimatedCost.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Payment Status:</Text>
                      <Text style={styles.infoValue}>{request.paymentStatus}</Text>
                    </View>
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🕐 Timeline</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Created:</Text>
                      <Text style={styles.infoValue}>{formatDate(request.createdAt)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Last Updated:</Text>
                      <Text style={styles.infoValue}>{formatDate(request.updatedAt)}</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={handleTrackRequest}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>📍 Track Request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.secondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.small,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  scrollView: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.large,
  },
  loadingContainer: {
    padding: SPACING.large * 2,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.large,
    paddingBottom: SPACING.medium,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 48,
    marginRight: SPACING.medium,
  },
  wasteType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  trackingId: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: SPACING.small,
    left: SPACING.small,
    right: SPACING.small,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.small / 2,
    paddingHorizontal: SPACING.small,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapOverlayText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: SPACING.medium,
    marginBottom: SPACING.large,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.small,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RequestDetailsBottomSheet;

