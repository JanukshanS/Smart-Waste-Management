import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const MapLegend = ({ 
  showBinLegend = true, 
  showRouteLegend = false, 
  compact = false,
  position = 'bottom-left' // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const binLegendItems = [
    { color: COLORS.error, label: 'Full Bins (≥90%)', icon: '🔴' },
    { color: '#FFA500', label: 'Filling Bins (70-89%)', icon: '🟠' },
    { color: '#4CAF50', label: 'Normal Bins (<70%)', icon: '🟢' },
    { color: '#757575', label: 'Offline Bins', icon: '⚫' },
    { color: '#FF9800', label: 'Maintenance', icon: '🟡' },
  ];

  const routeLegendItems = [
    { color: '#4CAF50', label: 'Completed Route', icon: '✅' },
    { color: COLORS.primary, label: 'In Progress', icon: '🚛' },
    { color: '#2196F3', label: 'Assigned Route', icon: '📋' },
    { color: '#9E9E9E', label: 'Draft Route', icon: '📝' },
  ];

  const getPositionStyles = () => {
    const baseStyle = {
      position: 'absolute',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-left':
        return { ...baseStyle, bottom: SPACING.large, left: SPACING.large };
      case 'bottom-right':
        return { ...baseStyle, bottom: SPACING.large, right: SPACING.large };
      case 'top-left':
        return { ...baseStyle, top: SPACING.large, left: SPACING.large };
      case 'top-right':
        return { ...baseStyle, top: SPACING.large, right: SPACING.large };
      default:
        return { ...baseStyle, bottom: SPACING.large, left: SPACING.large };
    }
  };

  const LegendItem = ({ color, label, icon }) => (
    <View style={styles.legendItem}>
      <View style={styles.legendIconContainer}>
        <Text style={styles.legendIcon}>{icon}</Text>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
      </View>
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );

  if (compact && !isExpanded) {
    return (
      <View style={[styles.container, styles.compactContainer, getPositionStyles()]}>
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandIcon}>ℹ️</Text>
          <Text style={styles.expandText}>Legend</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, getPositionStyles()]}>
      <View style={styles.header}>
        <Text style={styles.title}>Map Legend</Text>
        {compact && (
          <TouchableOpacity 
            style={styles.collapseButton}
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.collapseIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showBinLegend && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Bin Status</Text>
          {binLegendItems.map((item, index) => (
            <LegendItem
              key={`bin-${index}`}
              color={item.color}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </View>
      )}

      {showRouteLegend && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛣️ Route Status</Text>
          {routeLegendItems.map((item, index) => (
            <LegendItem
              key={`route-${index}`}
              color={item.color}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </View>
      )}

      {/* Additional Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap markers for details
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  compactContainer: {
    padding: SPACING.small,
    maxWidth: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  collapseButton: {
    padding: 4,
  },
  collapseIcon: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
  },
  expandIcon: {
    fontSize: 16,
  },
  expandText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendIconContainer: {
    position: 'relative',
    marginRight: SPACING.small,
    width: 20,
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 12,
  },
  legendDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: SPACING.small,
    marginTop: SPACING.small,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default MapLegend;
