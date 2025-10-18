import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Crosshair, Navigation } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';

const MapLocationPicker = ({ 
  initialLocation, 
  onLocationSelect,
  onAddressChange,
  onAreaChange 
}) => {
  const [region, setRegion] = useState({
    latitude: initialLocation?.lat || 6.9271,
    longitude: initialLocation?.lng || 79.8612,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.lat || 6.9271,
    longitude: initialLocation?.lng || 79.8612,
  });
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [area, setArea] = useState(initialLocation?.area || '');

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      const newPosition = {
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
      };
      setMarkerPosition(newPosition);
      setRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMarkerPosition(newPosition);
      setRegion({
        ...newPosition,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Notify parent
      onLocationSelect({
        lat: newPosition.latitude,
        lng: newPosition.longitude,
      });

      // Try to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: newPosition.latitude,
          longitude: newPosition.longitude,
        });

        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const fullAddress = [
            addr.streetNumber,
            addr.street,
            addr.city,
            addr.region,
          ].filter(Boolean).join(', ');
          
          const areaText = addr.city || addr.district || addr.region || '';
          
          setAddress(fullAddress);
          setArea(areaText);
          onAddressChange(fullAddress);
          onAreaChange(areaText);
        }
      } catch (error) {
        console.log('Reverse geocoding failed:', error);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setMarkerPosition(coordinate);
    
    // Notify parent
    onLocationSelect({
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    });

    // Try to get address
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const fullAddress = [
          addr.streetNumber,
          addr.street,
          addr.city,
          addr.region,
        ].filter(Boolean).join(', ');
        
        const areaText = addr.city || addr.district || addr.region || '';
        
        setAddress(fullAddress);
        setArea(areaText);
        onAddressChange(fullAddress);
        onAreaChange(areaText);
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
    }
  };

  const handleAddressChange = (text) => {
    setAddress(text);
    onAddressChange(text);
  };

  const handleAreaChange = (text) => {
    setArea(text);
    onAreaChange(text);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={handleMapPress}
          >
            <View style={styles.customMarker}>
              <MapPin size={32} color={COLORS.error} fill={COLORS.error} />
            </View>
          </Marker>
        </MapView>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Navigation size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>

        {/* Coordinates Display */}
        <View style={styles.coordsDisplay}>
          <Crosshair size={14} color={COLORS.primary} />
          <Text style={styles.coordsText}>
            {markerPosition.latitude.toFixed(6)}, {markerPosition.longitude.toFixed(6)}
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <MapPin size={16} color={COLORS.primary} />
        <Text style={styles.instructionsText}>
          Tap on map to select location or drag the pin
        </Text>
      </View>

      {/* Address Inputs */}
      <View style={styles.inputsContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={handleAddressChange}
            placeholder="e.g., 123 Main Street, Colombo 05"
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={2}
          />
          <Text style={styles.helperText}>
            Address will auto-fill when you select a location on the map
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Area</Text>
          <TextInput
            style={styles.input}
            value={area}
            onChangeText={handleAreaChange}
            placeholder="e.g., Colombo 05"
            placeholderTextColor={COLORS.textLight}
          />
          <Text style={styles.helperText}>
            Area will auto-fill when you select a location on the map
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    right: SPACING.medium,
    top: SPACING.medium,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  coordsDisplay: {
    position: 'absolute',
    bottom: SPACING.medium,
    left: SPACING.medium,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    marginTop: SPACING.medium,
    paddingHorizontal: SPACING.small,
  },
  instructionsText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  inputsContainer: {
    marginTop: SPACING.medium,
  },
  formGroup: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small,
    fontStyle: 'italic',
  },
});

export default MapLocationPicker;

