import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView from 'react-native-maps';
import { COLORS } from '../../constants/theme';
import BinMarker from './BinMarker';
import RoutePolyline from './RoutePolyline';
import MapControls from './MapControls';
import MapLegend from './MapLegend';

const InteractiveMap = ({
  bins = [],
  routes = [],
  onBinPress,
  onRoutePress,
  showBins = true,
  showRoutes = false,
  showControls = true,
  showLegend = true,
  initialRegion,
  style,
  mapType = 'standard',
  onMapTypeChange,
  filteredBinStatus = null, // Filter bins by status
  height = 300,
}) => {
  const mapRef = useRef(null);
  const [currentMapType, setCurrentMapType] = useState(mapType);
  const [region, setRegion] = useState(
    initialRegion || {
      latitude: 6.9271, // Colombo, Sri Lanka
      longitude: 79.8612,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }
  );

  // Filter bins based on status if provided
  const filteredBins = filteredBinStatus 
    ? bins.filter(bin => {
        switch (filteredBinStatus) {
          case 'urgent':
            return bin.fillLevel >= 90;
          case 'full':
            return bin.fillLevel >= 90;
          case 'filling':
            return bin.fillLevel >= 70 && bin.fillLevel < 90;
          case 'normal':
            return bin.fillLevel < 70;
          case 'offline':
            return bin.status === 'offline';
          case 'maintenance':
            return bin.status === 'maintenance';
          default:
            return true;
        }
      })
    : bins;

  // Auto-fit map to show all bins
  useEffect(() => {
    if (filteredBins.length > 0 && mapRef.current) {
      const coordinates = filteredBins
        .filter(bin => bin.location?.coordinates)
        .map(bin => ({
          latitude: bin.location.coordinates.lat,
          longitude: bin.location.coordinates.lng,
        }));

      if (coordinates.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [filteredBins]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const handleMyLocation = () => {
    // In a real app, you would use location services
    Alert.alert(
      'Location Services',
      'Location services would be used here to center the map on your current position.',
      [{ text: 'OK' }]
    );
  };

  const handleMapTypeChange = (newMapType) => {
    setCurrentMapType(newMapType);
    onMapTypeChange?.(newMapType);
  };

  const handleBinPress = (bin) => {
    onBinPress?.(bin);
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  return (
    <View style={[styles.container, style, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        mapType={currentMapType}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
      >
        {/* Render bin markers */}
        {showBins && filteredBins.map((bin) => (
          <BinMarker
            key={bin._id || bin.binId}
            bin={bin}
            onPress={handleBinPress}
            showCallout={true}
          />
        ))}

        {/* Render route polylines */}
        {showRoutes && routes.map((route) => (
          <RoutePolyline
            key={route._id}
            route={route}
            showStops={true}
            showProgress={route.status === 'in-progress'}
          />
        ))}
      </MapView>

      {/* Map Controls */}
      {showControls && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onMyLocation={handleMyLocation}
          onMapTypeChange={handleMapTypeChange}
          mapType={currentMapType}
          showMapTypeSelector={true}
          showLocationButton={true}
          showZoomControls={true}
        />
      )}

      {/* Map Legend */}
      {showLegend && (
        <MapLegend
          showBinLegend={showBins}
          showRouteLegend={showRoutes}
          compact={true}
          position="bottom-left"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
});

export default InteractiveMap;
