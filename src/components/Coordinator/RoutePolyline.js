import React from 'react';
import { Polyline, Marker } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const RoutePolyline = ({ route, showStops = true, showProgress = false }) => {
  if (!route?.stops || route.stops.length === 0) {
    return null;
  }

  // Extract coordinates from stops
  const coordinates = route.stops
    .filter(stop => stop.location?.coordinates)
    .map(stop => ({
      latitude: stop.location.coordinates.lat,
      longitude: stop.location.coordinates.lng,
    }));

  if (coordinates.length < 2) {
    return null; // Need at least 2 points for a polyline
  }

  const getRouteColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return COLORS.primary;
      case 'assigned':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getStopMarkerColor = (stop) => {
    switch (stop.status) {
      case 'completed':
        return '#4CAF50';
      case 'skipped':
        return '#FF9800';
      case 'pending':
      default:
        return COLORS.primary;
    }
  };

  const routeColor = getRouteColor(route.status);

  // Calculate completed portion for progress visualization
  const completedStops = route.stops.filter(stop => stop.status === 'completed').length;
  const progressPercentage = route.stops.length > 0 ? (completedStops / route.stops.length) : 0;

  return (
    <>
      {/* Main route polyline */}
      <Polyline
        coordinates={coordinates}
        strokeColor={routeColor}
        strokeWidth={4}
        lineDashPattern={route.status === 'draft' ? [10, 5] : undefined}
      />

      {/* Progress polyline for in-progress routes */}
      {showProgress && route.status === 'in-progress' && progressPercentage > 0 && (
        <Polyline
          coordinates={coordinates.slice(0, Math.ceil(coordinates.length * progressPercentage))}
          strokeColor="#4CAF50"
          strokeWidth={6}
          zIndex={1}
        />
      )}

      {/* Stop markers */}
      {showStops && route.stops
        .filter(stop => stop.location?.coordinates)
        .map((stop, index) => {
          const markerColor = getStopMarkerColor(stop);
          const isStart = index === 0;
          const isEnd = index === route.stops.filter(s => s.location?.coordinates).length - 1;
          const stopId = stop._id || stop.binId || stop.requestId || index;

          return (
            <Marker
              key={`${route._id || 'route'}-stop-${stopId}`}
              coordinate={{
                latitude: stop.location.coordinates.lat,
                longitude: stop.location.coordinates.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[
                styles.stopMarker,
                { backgroundColor: markerColor },
                isStart && styles.startMarker,
                isEnd && styles.endMarker,
              ]}>
                <Text style={styles.stopNumber}>
                  {isStart ? 'S' : isEnd ? 'E' : index + 1}
                </Text>
              </View>
            </Marker>
          );
        })
      }
    </>
  );
};

const styles = StyleSheet.create({
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startMarker: {
    backgroundColor: '#4CAF50',
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  endMarker: {
    backgroundColor: COLORS.error,
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  stopNumber: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RoutePolyline;
