import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import Button from '../../components/Button';

const BinDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bin, setBin] = useState(null);
  const [error, setError] = useState(null);

  const fetchBinDetails = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getBins();
      if (response.success) {
        // Find the specific bin
        const foundBin = response.data.find(b => b._id === id || b.binId === id);
        if (foundBin) {
          setBin(foundBin);
        } else {
          setError('Bin not found');
        }
      }
    } catch (err) {
      console.error('Error fetching bin details:', err);
      setError('Failed to load bin details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBinDetails();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBinDetails, 30 * 1000);
    return () => clearInterval(interval);
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBinDetails();
  };

  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 90) return COLORS.error;
    if (fillLevel >= 70) return '#FFA500';
    return '#4CAF50';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'offline':
        return '#757575';
      case 'maintenance':
        return '#FFA500';
      case 'full':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bin details...</Text>
      </View>
    );
  }

  if (error || !bin) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Bin not found'}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bin Details</Text>
        <Text style={styles.subtitle}>{bin.binId}</Text>

        {/* Fill Level Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Current Fill Level</Text>
            <View style={styles.fillLevelContainer}>
              <Text style={[styles.fillLevelText, { color: getFillLevelColor(bin.fillLevel) }]}>
                {bin.fillLevel}%
              </Text>
              <ProgressBar 
                progress={bin.fillLevel / 100} 
                color={getFillLevelColor(bin.fillLevel)}
                style={styles.progressBar}
              />
              <Text style={styles.fillLevelLabel}>
                {bin.fillLevel >= 90 ? 'Full - Needs Collection' : 
                 bin.fillLevel >= 70 ? 'Filling - Monitor Closely' : 
                 'Normal Level'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Location Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Location</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Area:</Text>
              <Text style={styles.infoValue}>{bin.location?.area || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{bin.location?.address || 'N/A'}</Text>
            </View>
            {bin.location?.coordinates && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coordinates:</Text>
                <Text style={styles.infoValue}>
                  {bin.location.coordinates.lat?.toFixed(6)}, {bin.location.coordinates.lng?.toFixed(6)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Status and Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Bin Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bin.status) }]}>
                <Text style={styles.statusText}>{bin.status || 'Unknown'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bin Type:</Text>
              <Text style={styles.infoValue}>{bin.binType || 'Standard'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacity:</Text>
              <Text style={styles.infoValue}>{bin.capacity || 'N/A'} L</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Collection History Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Collection History</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Collection:</Text>
              <Text style={styles.infoValue}>{formatDate(bin.lastCollection)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Collections:</Text>
              <Text style={styles.infoValue}>{bin.totalCollections || 0}</Text>
            </View>
            {bin.lastEmptiedBy && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Emptied By:</Text>
                <Text style={styles.infoValue}>{bin.lastEmptiedBy}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Maintenance Card */}
        {bin.maintenanceStatus && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Maintenance</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{bin.maintenanceStatus}</Text>
              </View>
              {bin.lastMaintenance && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Maintenance:</Text>
                  <Text style={styles.infoValue}>{formatDate(bin.lastMaintenance)}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            title="View on Map" 
            onPress={() => {/* Future: Open map view */}}
            disabled
          />
          <Button 
            title="Request Maintenance" 
            onPress={() => {/* Future: Create maintenance request */}}
            disabled
          />
          <Button 
            title="Collection History" 
            onPress={() => router.push(`/coordinator/collection-history?binId=${bin.binId}`)}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  content: {
    padding: SPACING.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  fillLevelContainer: {
    alignItems: 'center',
  },
  fillLevelText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: SPACING.small,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    width: '100%',
    marginBottom: SPACING.small,
  },
  fillLevelLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small / 2,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    gap: SPACING.medium,
    marginTop: SPACING.large,
    marginBottom: SPACING.large,
  },
});

export default BinDetailsScreen;

