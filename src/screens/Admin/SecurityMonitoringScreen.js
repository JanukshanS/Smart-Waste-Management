import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { Lock } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { adminApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const SecurityMonitoringScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'login-success', label: 'Login Success' },
    { value: 'login-failed', label: 'Login Failed' },
    { value: 'logout', label: 'Logout' },
    { value: 'suspicious-activity', label: 'Suspicious' },
  ];

  useEffect(() => {
    fetchSecurityLogs();
  }, [selectedFilter]);

  const fetchSecurityLogs = async () => {
    try {
      const filters = selectedFilter !== 'all' ? { eventType: selectedFilter } : {};
      const response = await adminApi.getSecurityLogs(filters);
      if (response.success) {
        setSecurityLogs(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching security logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSecurityLogs();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return COLORS.textLight;
    }
  };

  const renderLog = ({ item }) => (
    <Card style={styles.logCard}>
      <Card.Content>
        <View style={styles.logHeader}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.badgeText}>{item.severity}</Text>
          </View>
          <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <Text style={styles.eventType}>{item.eventType}</Text>
        {item.userId?.name && <Text style={styles.userName}>User: {item.userId.name}</Text>}
        {item.ipAddress && <Text style={styles.detail}>IP: {item.ipAddress}</Text>}
        <Text style={[styles.statusText, { color: item.success ? '#4CAF50' : COLORS.error }]}>
          {item.success ? '✓ Success' : '✗ Failed'}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Security Monitoring</Text>
      </View>

      <View style={styles.filtersSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.value && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={securityLogs}
        renderItem={renderLog}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Lock size={48} color={COLORS.textLight} style={styles.emptyIconComponent} />
            <Text style={styles.emptyText}>No security logs found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filtersSection: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
  },
  filterButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.large,
  },
  logCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  severityBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  userName: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.small,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.medium,
  },
  emptyIconComponent: {
    marginBottom: SPACING.medium,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default SecurityMonitoringScreen;

