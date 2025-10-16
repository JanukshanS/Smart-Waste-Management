import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS, SPACING } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MapPicker = ({ initialLocation, onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || {
      latitude: 6.9271, // Default: Colombo, Sri Lanka
      longitude: 79.8612,
    }
  );

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation = { latitude, longitude };
    setSelectedLocation(newLocation);
    onLocationSelect(newLocation);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        📍 Tap on the map to select location
      </Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={selectedLocation}
          title="Selected Location"
          description={`${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
        />
      </MapView>

      <View style={styles.coordinatesDisplay}>
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>Latitude:</Text>
          <Text style={styles.coordValue}>{selectedLocation.latitude.toFixed(6)}</Text>
        </View>
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>Longitude:</Text>
          <Text style={styles.coordValue}>{selectedLocation.longitude.toFixed(6)}</Text>
        </View>
      </View>

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>
          💡 Tip: Zoom and pan the map, then tap to select the exact location
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.medium,
  },
  instruction: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.small,
    fontWeight: '500',
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coordinatesDisplay: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginTop: SPACING.medium,
  },
  coordBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coordLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  hintBox: {
    backgroundColor: `${COLORS.info}15`,
    padding: SPACING.small,
    borderRadius: 8,
    marginTop: SPACING.small,
    borderWidth: 1,
    borderColor: `${COLORS.info}30`,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.info,
  },
});

export default MapPicker;

