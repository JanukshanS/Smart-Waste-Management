import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Mail, 
  Phone, 
  Home, 
  Building, 
  MapPin as MapPinIcon, 
  Calendar, 
  RefreshCw, 
  Hash,
  Trash2
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import { adminApi } from '../../api';

const UserDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUserById(id);
      
      if (response.success) {
        setUser(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch user details');
        router.back();
      }
    } catch (error) {
      console.error('Fetch user details error:', error);
      Alert.alert('Error', 'Failed to load user details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user?.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteUser,
        },
      ]
    );
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      const response = await adminApi.deleteUser(id);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'User deleted successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to delete user');
        setLoading(false);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      Alert.alert('Error', 'Failed to delete user. Please try again.');
      setLoading(false);
    }
  };

  const roleColors = {
    admin: COLORS.roleAdmin,
    citizen: COLORS.roleCitizen,
    coordinator: COLORS.roleCoordinator,
    technician: COLORS.roleTechnician,
  };

  // Note: roleIcons are rendered inline now with lucide-react-native components

  const statusColors = {
    active: COLORS.success,
    inactive: COLORS.gray,
    suspended: COLORS.danger,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const roleColor = roleColors[user.role] || COLORS.primary;
  const statusColor = statusColors[user.status] || COLORS.gray;

  return (
    <ScrollView style={styles.container}>
      {/* Header with Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        
        <View style={styles.badgesContainer}>
          <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15`, borderColor: roleColor }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor }]}>
              {user.role}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {user.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Mail size={16} color={COLORS.textLight} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Email</Text>
          </View>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Phone size={16} color={COLORS.textLight} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Phone</Text>
          </View>
          <Text style={styles.infoValue}>{user.phone}</Text>
        </View>
      </View>

      {/* Address Information */}
      {user.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Home size={16} color={COLORS.textLight} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Street</Text>
            </View>
            <Text style={styles.infoValue}>{user.address.street}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Building size={16} color={COLORS.textLight} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>City</Text>
            </View>
            <Text style={styles.infoValue}>{user.address.city}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Mail size={16} color={COLORS.textLight} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Postal Code</Text>
            </View>
            <Text style={styles.infoValue}>{user.address.postalCode}</Text>
          </View>
          
          {user.address.coordinates && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <MapPinIcon size={16} color={COLORS.textLight} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Coordinates</Text>
              </View>
              <Text style={styles.infoValue}>
                {user.address.coordinates.lat}, {user.address.coordinates.lng}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Calendar size={16} color={COLORS.textLight} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Created</Text>
          </View>
          <Text style={styles.infoValue}>
            {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <RefreshCw size={16} color={COLORS.textLight} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Last Updated</Text>
          </View>
          <Text style={styles.infoValue}>
            {new Date(user.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Hash size={16} color={COLORS.textLight} style={styles.infoIcon} />
            <Text style={styles.infoLabel}>User ID</Text>
          </View>
          <Text style={[styles.infoValue, styles.userId]}>{user._id}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Button
          title="Edit User"
          onPress={() => Alert.alert('Coming Soon', 'Edit user functionality will be added')}
          style={styles.actionButton}
        />
        
        <Button
          title="View Activity"
          onPress={() => Alert.alert('Coming Soon', 'User activity tracking will be added')}
          variant="outline"
          style={styles.actionButton}
        />

        <Button
          title="Delete User"
          onPress={handleDeleteUser}
          style={[styles.actionButton, styles.deleteButton]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.large,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 16,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.medium,
    padding: SPACING.large,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  infoRow: {
    marginBottom: SPACING.medium,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  userId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: COLORS.textLight,
  },
  actionsSection: {
    padding: SPACING.large,
  },
  actionButton: {
    marginBottom: SPACING.medium,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
});

export default UserDetailsScreen;

