import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const ReportStatCard = ({ icon, label, value, trend, trendLabel, color = COLORS.primary }) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <Text style={[styles.value, { color }]}>{value}</Text>
      
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, trend > 0 ? styles.trendUp : styles.trendDown]}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Text>
          {trendLabel && <Text style={styles.trendLabel}>{trendLabel}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.small,
  },
  label: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SPACING.small / 2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: SPACING.small / 2,
  },
  trendUp: {
    color: COLORS.success,
  },
  trendDown: {
    color: COLORS.danger,
  },
  trendLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});

export default ReportStatCard;

