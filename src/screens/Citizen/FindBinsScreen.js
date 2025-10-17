import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, RefreshCw } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { BinDetailsBottomSheet, CitizenBottomNav } from '../../components/Citizen';
import { citizenApi } from '../../api';

const FindBinsScreen = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bins, setBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyBins();
    }
  }, [location, searchRadius]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to find nearby bins. Please enable it in settings.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      setLocation({
        lat: latitude,
        lng: longitude,
      });

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
      setLoading(false);
    }
  };

  const fetchNearbyBins = async () => {
    if (!location) return;

    try {
      setRefreshing(true);
      const response = await citizenApi.getNearbyBins({
        lat: location.lat,
        lng: location.lng,
        radius: searchRadius,
      });

      if (response.success && response.data) {
        setBins(response.data);
      }
    } catch (error) {
      console.error('Error fetching nearby bins:', error);
      Alert.alert('Error', 'Failed to fetch nearby bins');
    } finally {
      setRefreshing(false);
    }
  };

  const handleBinMarkerPress = (bin) => {
    setSelectedBin(bin);
    setShowBottomSheet(true);
  };

  const handleRefresh = () => {
    getCurrentLocation();
  };

  const changeRadius = (newRadius) => {
    setSearchRadius(newRadius);
  };

  const getMarkerColor = (fillStatusColor) => {
    switch (fillStatusColor) {
      case 'green':
        return COLORS.success;
      case 'yellow':
        return COLORS.warning;
      case 'red':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <MapPin size={64} color={COLORS.primary} />
        <Text style={styles.errorTitle}>Location Not Available</Text>
        <Text style={styles.errorText}>
          Please enable location services to find nearby bins
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={setMapRegion}
      >
        {/* Search radius circle */}
        {location && (
          <Circle
            center={{
              latitude: location.lat,
              longitude: location.lng,
            }}
            radius={searchRadius}
            strokeColor={COLORS.primary + '40'}
            fillColor={COLORS.primary + '10'}
            strokeWidth={2}
          />
        )}

        {/* Bin markers */}
        {bins.map((bin) => (
          <Marker
            key={bin._id}
            coordinate={{
              latitude: bin.location.coordinates.lat,
              longitude: bin.location.coordinates.lng,
            }}
            pinColor={getMarkerColor(bin.fillStatusColor)}
            onPress={() => handleBinMarkerPress(bin)}
          >
            <View style={[styles.markerContainer, { borderColor: getMarkerColor(bin.fillStatusColor) }]}>
              <Text style={styles.markerText}>{bin.fillLevel}%</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.infoPanelHeader}>
          <Text style={styles.infoPanelTitle}>Nearby Bins</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw 
              size={20} 
              color={COLORS.primary} 
              style={refreshing ? { transform: [{ rotate: '360deg' }] } : {}}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bins.length}</Text>
            <Text style={styles.statLabel}>Total Bins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {bins.filter((b) => b.fillStatusColor === 'green').length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {bins.filter((b) => b.needsCollection).length}
            </Text>
            <Text style={styles.statLabel}>Needs Collection</Text>
          </View>
        </View>

        {/* Radius Controls */}
        <View style={styles.radiusControls}>
          <Text style={styles.radiusLabel}>Search Radius:</Text>
          <View style={styles.radiusButtons}>
            {[2000, 5000, 10000].map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  searchRadius === radius && styles.radiusButtonActive,
                ]}
                onPress={() => changeRadius(radius)}
              >
                <Text
                  style={[
                    styles.radiusButtonText,
                    searchRadius === radius && styles.radiusButtonTextActive,
                  ]}
                >
                  {radius / 1000}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Status:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Filling</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.legendText}>Full</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bin Details Bottom Sheet */}
      <BinDetailsBottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        bin={selectedBin}
      />
      
      {/* Bottom Navigation */}
      <CitizenBottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: SPACING.medium,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large * 2,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  infoPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  infoPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  refreshButton: {
    backgroundColor: COLORS.background,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.medium,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  radiusControls: {
    marginBottom: SPACING.medium,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    flex: 1,
    paddingVertical: SPACING.small,
    marginHorizontal: 4,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  radiusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  radiusButtonTextActive: {
    color: COLORS.white,
  },
  legend: {
    marginTop: SPACING.small,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default FindBinsScreen;
