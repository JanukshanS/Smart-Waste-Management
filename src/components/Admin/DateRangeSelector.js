import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const DateRangeSelector = ({ startDate, endDate, onStartDateChange, onEndDateChange, presets = [] }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date Range</Text>
      
      {/* Preset Buttons */}
      {presets.length > 0 && (
        <View style={styles.presetsContainer}>
          {presets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={styles.presetButton}
              onPress={preset.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.presetText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Date Display */}
      <View style={styles.dateContainer}>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
        </View>
        
        <Text style={styles.dateSeparator}>→</Text>
        
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.medium,
    gap: SPACING.small,
  },
  presetButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateSeparator: {
    fontSize: 20,
    color: COLORS.textLight,
    marginHorizontal: SPACING.small,
  },
});

export default DateRangeSelector;

