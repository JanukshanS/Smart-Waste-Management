import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

// Note: This is a placeholder for map functionality
// In a real implementation, you would use react-native-maps or similar
const BinMapView = ({ bins, onBinPress, selectedBin }) => {
  const getBinMarkerColor = (bin) => {
    if (bin.fillLevel >= 90) return COLORS.error;
    if (bin.fillLevel >= 70) return '#FFA500';
    return '#4CAF50';
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>📍 Bin Locations</Text>
          <Text style={styles.subtitle}>{bins.length} bins</Text>
        </View>

        {/* Placeholder Map Area */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            🗺️ Interactive Map View
          </Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Map integration coming soon
          </Text>
          
          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legend:</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.legendText}>Full (≥90%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                <Text style={styles.legendText}>Filling (70-89%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Normal (&lt;70%)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bin List for Map */}
        <View style={styles.binsList}>
          <Text style={styles.binsListTitle}>Nearby Bins:</Text>
          {bins.slice(0, 3).map((bin, index) => (
            <TouchableOpacity
              key={bin._id || index}
              style={[
                styles.binListItem,
                selectedBin?._id === bin._id && styles.selectedBinItem
              ]}
              onPress={() => onBinPress?.(bin)}
            >
              <View style={styles.binListItemLeft}>
                <View 
                  style={[
                    styles.binMarker, 
                    { backgroundColor: getBinMarkerColor(bin) }
                  ]} 
                />
                <View>
                  <Text style={styles.binListItemId}>{bin.binId}</Text>
                  <Text style={styles.binListItemLocation} numberOfLines={1}>
                    {bin.location?.address || 'Unknown'}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.binListItemFill,
                { color: getBinMarkerColor(bin) }
              ]}>
                {bin.fillLevel}%
              </Text>
            </TouchableOpacity>
          ))}
          
          {bins.length > 3 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                View all {bins.length} bins on map
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 24,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.medium,
  },
  legend: {
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  legendItems: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  binsList: {
    marginTop: SPACING.small,
  },
  binsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  binListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedBinItem: {
    backgroundColor: COLORS.primary + '10',
  },
  binListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    flex: 1,
  },
  binMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  binListItemId: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  binListItemLocation: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  binListItemFill: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewAllButton: {
    paddingVertical: SPACING.small,
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default BinMapView;
