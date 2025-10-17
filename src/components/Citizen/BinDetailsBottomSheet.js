import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SPACING } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BinDetailsBottomSheet = ({ visible, onClose, bin }) => {
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

  if (!bin) return null;

  const binTypeIcons = {
    household: '🏠',
    recyclable: '♻️',
    organic: '🌱',
    general: '🗑️',
    hazardous: '⚠️',
  };

  const fillStatusInfo = {
    green: { label: 'Available', color: COLORS.success },
    yellow: { label: 'Filling', color: COLORS.warning },
    red: { label: 'Full', color: COLORS.error },
  };

  const statusInfo = fillStatusInfo[bin.fillStatusColor] || { label: 'Unknown', color: COLORS.gray };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.icon}>
                  {binTypeIcons[bin.binType] || '🗑️'}
                </Text>
                <View>
                  <Text style={styles.binId}>{bin.binId}</Text>
                  <Text style={styles.binType}>
                    {bin.binType.charAt(0).toUpperCase() + bin.binType.slice(1)} Bin
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>

            {/* Fill Level Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fill Level</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${bin.fillLevel}%`,
                        backgroundColor: statusInfo.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{bin.fillLevel}%</Text>
              </View>
              <View style={styles.capacityInfo}>
                <Text style={styles.capacityText}>
                  Capacity: {bin.capacity}L
                </Text>
                {bin.needsCollection && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>
                      {bin.isUrgent ? '⚠️ Urgent Collection' : '⚡ Needs Collection'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{bin.location.address || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Area:</Text>
                  <Text style={styles.infoValue}>{bin.location.area || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Coordinates:</Text>
                  <Text style={styles.infoValue}>
                    {bin.location.coordinates.lat.toFixed(4)}, {bin.location.coordinates.lng.toFixed(4)}
                  </Text>
                </View>
              </View>

              {/* Map */}
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: bin.location.coordinates.lat,
                    longitude: bin.location.coordinates.lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: bin.location.coordinates.lat,
                      longitude: bin.location.coordinates.lng,
                    }}
                    title={bin.binId}
                    description={bin.location.address}
                  />
                </MapView>
              </View>
            </View>

            {/* Bin Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bin Details</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text style={[styles.infoValue, { color: bin.status === 'active' ? COLORS.success : COLORS.error }]}>
                    {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Collections:</Text>
                  <Text style={styles.infoValue}>{bin.collectionCount || 0} times</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Updated:</Text>
                  <Text style={styles.infoValue}>{formatDate(bin.lastUpdated)}</Text>
                </View>
                {bin.lastEmptied && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Last Emptied:</Text>
                    <Text style={styles.infoValue}>{formatDate(bin.lastEmptied)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  binId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  binType: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  progressBar: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.medium,
  },
  progressFill: {
    height: '100%',
    borderRadius: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 45,
  },
  capacityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  warningBadge: {
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.warningText,
    fontWeight: '600',
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
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.small,
    marginBottom: SPACING.large,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BinDetailsBottomSheet;

