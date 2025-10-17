import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import { coordinatorApi } from '../../api';

const CoordinatorDashboardScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await coordinatorApi.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Coordinator Dashboard</Text>
        <Text style={styles.subtitle}>Route & Collection Management</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Statistics Section */}
        {dashboardData && (
          <>
            <Text style={styles.sectionTitle}>Overview</Text>
            
            {/* Bins Statistics */}
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statTitle}>Smart Bins</Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dashboardData.bins?.total || 0}</Text>
                    <Text style={styles.statLabel}>Total Bins</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: COLORS.error }]}>
                      {dashboardData.bins?.full || 0}
                    </Text>
                    <Text style={styles.statLabel}>Full (≥90%)</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFA500' }]}>
                      {dashboardData.bins?.filling || 0}
                    </Text>
                    <Text style={styles.statLabel}>Filling (70-89%)</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Requests Statistics */}
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statTitle}>Waste Requests</Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#FFA500' }]}>
                      {dashboardData.requests?.pending || 0}
                    </Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                      {dashboardData.requests?.approved || 0}
                    </Text>
                    <Text style={styles.statLabel}>Approved</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Routes Statistics */}
            <Card style={styles.statCard}>
              <Card.Content>
                <Text style={styles.statTitle}>Collection Routes</Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dashboardData.routes?.active || 0}</Text>
                    <Text style={styles.statLabel}>Active Routes</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="Smart Bins" 
            onPress={() => router.push('/coordinator/bins')}
          />
          
          <Button 
            title="Manage Requests" 
            onPress={() => router.push('/coordinator/requests')}
          />
          
          <Button 
            title="Collection Routes" 
            onPress={() => router.push('/coordinator/routes')}
          />
          
          <Button 
            title="Create Route" 
            onPress={() => router.push('/coordinator/create-route')}
          />
        </View>
      </ScrollView>
    </View>
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
  },
  content: {
    flex: 1,
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
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
    marginTop: SPACING.small,
  },
  statCard: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: SPACING.medium,
    marginBottom: SPACING.large,
  },
});

export default CoordinatorDashboardScreen;

