import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinStatsOverview = ({ bins, onCategoryPress }) => {
  // Calculate statistics
  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.fillLevel >= 90).length;
  const fillingBins = bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 90).length;
  const normalBins = bins.filter(b => b.fillLevel < 70).length;
  const offlineBins = bins.filter(b => b.status === 'offline').length;
  const maintenanceBins = bins.filter(b => b.status === 'maintenance').length;

  // Calculate average fill level
  const avgFillLevel = totalBins > 0 
    ? Math.round(bins.reduce((sum, bin) => sum + (bin.fillLevel || 0), 0) / totalBins)
    : 0;

  // Calculate collection efficiency (bins collected in last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentlyCollected = bins.filter(b => 
    b.lastCollection && new Date(b.lastCollection) >= weekAgo
  ).length;
  const collectionEfficiency = totalBins > 0 ? Math.round((recentlyCollected / totalBins) * 100) : 0;

  const StatCard = ({ title, value, color, subtitle, onPress, progress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        {progress !== undefined && (
          <ProgressBar 
            progress={progress / 100} 
            color={color}
            style={styles.statProgress}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Bin Statistics Overview</Text>
          <Text style={styles.subtitle}>Real-time monitoring data</Text>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Bins"
            value={totalBins}
            color={COLORS.primary}
            subtitle="Active monitoring"
            onPress={() => onCategoryPress?.('all')}
          />
          
          <StatCard
            title="Full Bins"
            value={fullBins}
            color={COLORS.error}
            subtitle="≥90% capacity"
            onPress={() => onCategoryPress?.('full')}
          />
          
          <StatCard
            title="Filling Bins"
            value={fillingBins}
            color="#FFA500"
            subtitle="70-89% capacity"
            onPress={() => onCategoryPress?.('filling')}
          />
          
          <StatCard
            title="Normal Bins"
            value={normalBins}
            color="#4CAF50"
            subtitle="<70% capacity"
            onPress={() => onCategoryPress?.('normal')}
          />
        </View>

        {/* Secondary Stats */}
        <View style={styles.secondaryStats}>
          <View style={styles.secondaryStatItem}>
            <Text style={styles.secondaryStatLabel}>Average Fill Level</Text>
            <View style={styles.secondaryStatValue}>
              <Text style={[styles.secondaryStatNumber, { 
                color: avgFillLevel >= 70 ? COLORS.error : '#4CAF50' 
              }]}>
                {avgFillLevel}%
              </Text>
              <ProgressBar 
                progress={avgFillLevel / 100} 
                color={avgFillLevel >= 70 ? COLORS.error : '#4CAF50'}
                style={styles.secondaryStatProgress}
              />
            </View>
          </View>

          <View style={styles.secondaryStatItem}>
            <Text style={styles.secondaryStatLabel}>Collection Efficiency</Text>
            <View style={styles.secondaryStatValue}>
              <Text style={[styles.secondaryStatNumber, { 
                color: collectionEfficiency >= 80 ? '#4CAF50' : '#FFA500' 
              }]}>
                {collectionEfficiency}%
              </Text>
              <ProgressBar 
                progress={collectionEfficiency / 100} 
                color={collectionEfficiency >= 80 ? '#4CAF50' : '#FFA500'}
                style={styles.secondaryStatProgress}
              />
            </View>
          </View>
        </View>

        {/* Status Indicators */}
        {(offlineBins > 0 || maintenanceBins > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.alertsTitle}>⚠️ Attention Required</Text>
            {offlineBins > 0 && (
              <TouchableOpacity 
                style={styles.alertItem}
                onPress={() => onCategoryPress?.('offline')}
              >
                <View style={[styles.alertDot, { backgroundColor: '#9E9E9E' }]} />
                <Text style={styles.alertText}>
                  {offlineBins} bin{offlineBins !== 1 ? 's' : ''} offline
                </Text>
              </TouchableOpacity>
            )}
            {maintenanceBins > 0 && (
              <TouchableOpacity 
                style={styles.alertItem}
                onPress={() => onCategoryPress?.('maintenance')}
              >
                <View style={[styles.alertDot, { backgroundColor: '#FFA500' }]} />
                <Text style={styles.alertText}>
                  {maintenanceBins} bin{maintenanceBins !== 1 ? 's' : ''} need maintenance
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onCategoryPress?.('urgent')}
          >
            <Text style={styles.actionButtonText}>View Urgent Bins</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={() => onCategoryPress?.('schedule')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
              Schedule Collections
            </Text>
          </TouchableOpacity>
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
    marginBottom: SPACING.medium,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: SPACING.medium,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  statProgress: {
    width: '100%',
    height: 4,
    marginTop: 4,
  },
  secondaryStats: {
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  secondaryStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryStatLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  secondaryStatValue: {
    alignItems: 'flex-end',
    flex: 1,
  },
  secondaryStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  secondaryStatProgress: {
    width: 100,
    height: 4,
  },
  alertsSection: {
    backgroundColor: '#FFF3E0',
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.small,
  },
  alertText: {
    fontSize: 12,
    color: COLORS.text,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryActionText: {
    color: COLORS.primary,
  },
});

export default BinStatsOverview;
