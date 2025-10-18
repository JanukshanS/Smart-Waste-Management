import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Users, 
  ClipboardList, 
  Trash2, 
  Smartphone, 
  Wrench, 
  Truck, 
  AlertTriangle, 
  AlertCircle,
  BarChart3
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import DashboardHeader from '../../components/DashboardHeader';
import { StatCard, ExpandableCard, MiniStat, RoleBadge } from '../../components/Admin';
import { adminApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboardScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              router.replace('/auth-landing');
            } else {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  const data = dashboardData || {};

  return (
    <View style={styles.container}>
      <DashboardHeader 
        title="Admin Dashboard"
        subtitle="System Overview & Management"
        rightComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >

      {/* Quick Stats - Always Visible */}
      <View style={styles.quickStatsContainer}>
        <View style={styles.row}>
          <StatCard
            icon={<Users size={24} color={COLORS.info} />}
            title="Total Users"
            value={data.users?.total || 0}
            subtitle={`${data.users?.active || 0} active`}
            color={COLORS.info}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <StatCard
              icon={<ClipboardList size={24} color={COLORS.success} />}
              title="Requests"
              value={data.requests?.total || 0}
              subtitle={`${data.requests?.thisMonth || 0} this month`}
              color={COLORS.success}
            />
          </View>
          <View style={styles.halfCard}>
            <StatCard
              icon={<Trash2 size={24} color={data.bins?.full > 0 ? COLORS.danger : COLORS.warning} />}
              title="Smart Bins"
              value={data.bins?.total || 0}
              subtitle={`${data.bins?.full || 0} full`}
              color={data.bins?.full > 0 ? COLORS.danger : COLORS.warning}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <StatCard
              icon={<Smartphone size={24} color={data.devices?.offline > 0 ? COLORS.danger : COLORS.purple} />}
              title="Devices"
              value={data.devices?.total || 0}
              subtitle={`${data.devices?.offline || 0} offline`}
              color={data.devices?.offline > 0 ? COLORS.danger : COLORS.purple}
            />
          </View>
          <View style={styles.halfCard}>
            <StatCard
              icon={<Wrench size={24} color={COLORS.roleAdmin} />}
              title="Work Orders"
              value={data.workOrders?.total || 0}
              subtitle={`${data.workOrders?.pending || 0} pending`}
              color={COLORS.roleAdmin}
            />
          </View>
        </View>
      </View>

      {/* Expandable Detailed Sections */}
      <View style={styles.detailsContainer}>
        {/* Users Section */}
        <ExpandableCard title="User Management" icon={<Users size={24} color={COLORS.primary} />} defaultExpanded={true}>
          <View style={styles.statsRow}>
            <MiniStat label="Total" value={data.users?.total || 0} color={COLORS.info} />
            <MiniStat label="Active" value={data.users?.active || 0} color={COLORS.success} />
            <MiniStat label="Inactive" value={(data.users?.total || 0) - (data.users?.active || 0)} color={COLORS.textLight} />
          </View>

          {data.users?.byRole && data.users.byRole.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Users by Role</Text>
              <View style={styles.rolesContainer}>
                {data.users.byRole.map((role, index) => (
                  <RoleBadge key={index} role={role._id} count={role.count} />
                ))}
              </View>
            </>
          )}

          <Button 
            title="Manage Users" 
            onPress={() => router.push('/admin/users')}
            style={styles.actionButton}
          />
        </ExpandableCard>

        {/* Waste Requests Section */}
        <ExpandableCard title="Waste Requests" icon={<ClipboardList size={24} color={COLORS.primary} />}>
          <View style={styles.statsRow}>
            <MiniStat label="Total" value={data.requests?.total || 0} color={COLORS.info} />
            <MiniStat label="Pending" value={data.requests?.pending || 0} color={COLORS.warning} />
            <MiniStat label="Completed" value={data.requests?.completed || 0} color={COLORS.success} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>This Month:</Text>
            <Text style={styles.infoValue}>{data.requests?.thisMonth || 0} requests</Text>
          </View>

          {data.requests?.pending > 0 && (
            <View style={styles.alertBox}>
              <AlertTriangle size={20} color={COLORS.warning} style={styles.alertIconComponent} />
              <Text style={styles.alertText}>
                {data.requests.pending} request{data.requests.pending > 1 ? 's' : ''} need attention
              </Text>
            </View>
          )}
        </ExpandableCard>

        {/* Smart Bins Section */}
        <ExpandableCard title="Smart Bins Status" icon={<Trash2 size={24} color={COLORS.primary} />}>
          <View style={styles.statsRow}>
            <MiniStat label="Total" value={data.bins?.total || 0} color={COLORS.info} />
            <MiniStat label="Active" value={data.bins?.active || 0} color={COLORS.success} />
            <MiniStat label="Full" value={data.bins?.full || 0} color={COLORS.danger} />
          </View>

          {data.bins?.full > 0 && (
            <View style={[styles.alertBox, styles.alertBoxDanger]}>
              <AlertCircle size={20} color={COLORS.danger} style={styles.alertIconComponent} />
              <Text style={[styles.alertText, styles.alertTextDanger]}>
                {data.bins.full} bin{data.bins.full > 1 ? 's' : ''} require immediate attention!
              </Text>
            </View>
          )}

          <View style={styles.progressBar}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${data.bins?.total > 0 ? (data.bins.active / data.bins.total * 100) : 0}%`,
                    backgroundColor: COLORS.primary 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {data.bins?.total > 0 ? Math.round(data.bins.active / data.bins.total * 100) : 0}% Active
            </Text>
          </View>
        </ExpandableCard>

        {/* Collection Routes Section */}
        <ExpandableCard title="Collection Routes" icon={<Truck size={24} color={COLORS.primary} />}>
          <View style={styles.statsRow}>
            <MiniStat label="Total" value={data.routes?.total || 0} color={COLORS.info} />
            <MiniStat label="Active" value={data.routes?.active || 0} color={COLORS.success} />
            <MiniStat label="Completed" value={data.routes?.completed || 0} color={COLORS.gray} />
          </View>
        </ExpandableCard>

        {/* IoT Devices Section */}
        <ExpandableCard title="IoT Devices" icon={<Smartphone size={24} color={COLORS.primary} />}>
          <View style={styles.statsRow}>
            <MiniStat label="Total" value={data.devices?.total || 0} color={COLORS.info} />
            <MiniStat label="Online" value={data.devices?.active || 0} color={COLORS.success} />
            <MiniStat label="Offline" value={data.devices?.offline || 0} color={COLORS.danger} />
          </View>

          {data.devices?.offline > 0 && (
            <View style={[styles.alertBox, styles.alertBoxWarning]}>
              <AlertCircle size={20} color={COLORS.warning} style={styles.alertIconComponent} />
              <Text style={[styles.alertText, styles.alertTextWarning]}>
                {data.devices.offline} device{data.devices.offline > 1 ? 's' : ''} offline
              </Text>
            </View>
          )}

          <View style={styles.progressBar}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${data.devices?.total > 0 ? (data.devices.active / data.devices.total * 100) : 0}%`,
                    backgroundColor: COLORS.success 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {data.devices?.total > 0 ? Math.round(data.devices.active / data.devices.total * 100) : 0}% Uptime
            </Text>
          </View>
        </ExpandableCard>

        {/* Work Orders Section */}
        <ExpandableCard title="Work Orders" icon={<Wrench size={24} color={COLORS.primary} />}>
          <View style={styles.statsRow}>
            <MiniStat label="Total" value={data.workOrders?.total || 0} color={COLORS.info} />
            <MiniStat label="Pending" value={data.workOrders?.pending || 0} color={COLORS.warning} />
            <MiniStat label="Resolved" value={data.workOrders?.resolved || 0} color={COLORS.success} />
          </View>

          {data.workOrders?.pending > 0 && (
            <View style={styles.alertBox}>
              <AlertTriangle size={20} color={COLORS.warning} style={styles.alertIconComponent} />
              <Text style={styles.alertText}>
                {data.workOrders.pending} work order{data.workOrders.pending > 1 ? 's' : ''} pending
              </Text>
            </View>
          )}
        </ExpandableCard>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <Button 
          title="View Reports" 
          onPress={() => router.push('/admin/reports')}
          style={styles.actionButtonSpacing}
        />
        
        <Button 
          title="Bin Management" 
          onPress={() => router.push('/admin/bins')}
          variant="secondary"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Last updated: {new Date().toLocaleString()}</Text>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.textLight,
  },
  quickStatsContainer: {
    padding: SPACING.medium,
    paddingTop: SPACING.small,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.small,
  },
  halfCard: {
    flex: 1,
    marginHorizontal: SPACING.small / 2,
  },
  detailsContainer: {
    padding: SPACING.medium,
    paddingTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.medium,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
    marginTop: SPACING.small,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.medium,
  },
  actionButton: {
    marginTop: SPACING.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBg,
    padding: SPACING.medium,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginTop: SPACING.small,
  },
  alertBoxDanger: {
    backgroundColor: COLORS.dangerBg,
    borderLeftColor: COLORS.danger,
  },
  alertBoxWarning: {
    backgroundColor: COLORS.warningBg,
    borderLeftColor: COLORS.warning,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: SPACING.small,
  },
  alertIconComponent: {
    marginRight: SPACING.small,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.warningText,
    fontWeight: '600',
  },
  alertTextDanger: {
    color: COLORS.dangerText,
  },
  alertTextWarning: {
    color: COLORS.warningText,
  },
  progressBar: {
    marginTop: SPACING.medium,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small / 2,
    textAlign: 'right',
  },
  actionsContainer: {
    padding: SPACING.medium,
    paddingTop: 0,
  },
  actionButtonSpacing: {
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  footer: {
    padding: SPACING.medium,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
