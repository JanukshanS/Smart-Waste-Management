import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { COLORS, SPACING } from '../../constants/theme';

const BinMarker = ({ bin, onPress, showCallout = true }) => {
  const getBinMarkerColor = (fillLevel, status) => {
    if (status === 'offline') return '#757575';
    if (status === 'maintenance') return '#FF9800';
    if (fillLevel >= 90) return COLORS.error;
    if (fillLevel >= 70) return '#FFA500';
    return '#4CAF50';
  };

  const getBinPriority = (fillLevel) => {
    if (fillLevel >= 90) return 'URGENT';
    if (fillLevel >= 70) return 'MEDIUM';
    return 'LOW';
  };

  const formatLastCollection = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const markerColor = getBinMarkerColor(bin.fillLevel || 0, bin.status);
  const priority = getBinPriority(bin.fillLevel || 0);

  if (!bin.location?.coordinates) {
    return null; // Don't render marker if no coordinates
  }

  return (
    <Marker
      coordinate={{
        latitude: bin.location.coordinates.lat,
        longitude: bin.location.coordinates.lng,
      }}
      onPress={() => onPress?.(bin)}
      pinColor={markerColor}
      identifier={bin._id || bin.binId}
    >
      {/* Custom Marker View */}
      <View style={[styles.markerContainer, { borderColor: markerColor }]}>
        <View style={[styles.markerInner, { backgroundColor: markerColor }]}>
          <Text style={styles.markerText}>{bin.fillLevel || 0}%</Text>
        </View>
        {priority === 'URGENT' && (
          <View style={styles.urgentIndicator}>
            <Text style={styles.urgentText}>!</Text>
          </View>
        )}
      </View>

      {/* Callout with bin details */}
      {showCallout && (
        <Callout tooltip onPress={() => onPress?.(bin)}>
          <View style={styles.calloutContainer}>
            <View style={styles.calloutHeader}>
              <Text style={styles.calloutTitle}>{bin.binId}</Text>
              <View style={[styles.calloutStatus, { backgroundColor: markerColor }]}>
                <Text style={styles.calloutStatusText}>{priority}</Text>
              </View>
            </View>
            
            <Text style={styles.calloutAddress} numberOfLines={2}>
              📍 {bin.location?.address || 'Unknown Location'}
            </Text>
            
            <View style={styles.calloutDetails}>
              <Text style={styles.calloutDetail}>
                Fill Level: <Text style={[styles.calloutValue, { color: markerColor }]}>
                  {bin.fillLevel || 0}%
                </Text>
              </Text>
              <Text style={styles.calloutDetail}>
                Status: <Text style={styles.calloutValue}>{bin.status || 'Unknown'}</Text>
              </Text>
              <Text style={styles.calloutDetail}>
                Last Collection: <Text style={styles.calloutValue}>
                  {formatLastCollection(bin.lastCollection)}
                </Text>
              </Text>
            </View>

            <View style={styles.calloutFooter}>
              <Text style={styles.calloutTap}>Tap for details</Text>
            </View>
          </View>
        </Callout>
      )}
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  urgentIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  calloutContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    minWidth: 250,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  calloutStatus: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calloutStatusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  calloutAddress: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.small,
  },
  calloutDetails: {
    marginBottom: SPACING.small,
  },
  calloutDetail: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  calloutValue: {
    fontWeight: '600',
    color: COLORS.text,
  },
  calloutFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: SPACING.small,
    alignItems: 'center',
  },
  calloutTap: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default BinMarker;
