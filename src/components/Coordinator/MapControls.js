import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const MapControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onMyLocation, 
  onMapTypeChange, 
  mapType = 'standard',
  showMapTypeSelector = true,
  showLocationButton = true,
  showZoomControls = true 
}) => {
  const [showMapTypes, setShowMapTypes] = useState(false);

  const mapTypes = [
    { key: 'standard', label: 'Standard', icon: '🗺️' },
    { key: 'satellite', label: 'Satellite', icon: '🛰️' },
    { key: 'hybrid', label: 'Hybrid', icon: '🌍' },
    { key: 'terrain', label: 'Terrain', icon: '🏔️' },
  ];

  const handleMyLocation = () => {
    if (onMyLocation) {
      onMyLocation();
    } else {
      Alert.alert('Location', 'Getting your location...');
    }
  };

  const handleMapTypeSelect = (type) => {
    onMapTypeChange?.(type);
    setShowMapTypes(false);
  };

  return (
    <View style={styles.container}>
      {/* Zoom Controls */}
      {showZoomControls && (
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={onZoomIn}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.zoomButton, styles.zoomButtonBottom]} 
            onPress={onZoomOut}
            activeOpacity={0.7}
          >
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* My Location Button */}
      {showLocationButton && (
        <TouchableOpacity 
          style={styles.locationButton} 
          onPress={handleMyLocation}
          activeOpacity={0.7}
        >
          <Text style={styles.locationIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Map Type Selector */}
      {showMapTypeSelector && (
        <View style={styles.mapTypeContainer}>
          <TouchableOpacity 
            style={styles.mapTypeButton} 
            onPress={() => setShowMapTypes(!showMapTypes)}
            activeOpacity={0.7}
          >
            <Text style={styles.mapTypeIcon}>
              {mapTypes.find(t => t.key === mapType)?.icon || '🗺️'}
            </Text>
          </TouchableOpacity>

          {/* Map Type Options */}
          {showMapTypes && (
            <View style={styles.mapTypeOptions}>
              {mapTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.mapTypeOption,
                    mapType === type.key && styles.mapTypeOptionActive
                  ]}
                  onPress={() => handleMapTypeSelect(type.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mapTypeOptionIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.mapTypeOptionText,
                    mapType === type.key && styles.mapTypeOptionTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.large,
    right: SPACING.large,
    zIndex: 1000,
  },
  zoomControls: {
    marginBottom: SPACING.small,
  },
  zoomButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  zoomButtonBottom: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  locationButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationIcon: {
    fontSize: 20,
  },
  mapTypeContainer: {
    position: 'relative',
  },
  mapTypeButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapTypeIcon: {
    fontSize: 20,
  },
  mapTypeOptions: {
    position: 'absolute',
    top: 0,
    right: 54,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: SPACING.small,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  mapTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  mapTypeOptionActive: {
    backgroundColor: COLORS.primary + '15',
  },
  mapTypeOptionIcon: {
    fontSize: 16,
    marginRight: SPACING.small,
  },
  mapTypeOptionText: {
    fontSize: 14,
    color: COLORS.text,
  },
  mapTypeOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default MapControls;
