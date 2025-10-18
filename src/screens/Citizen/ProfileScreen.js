import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  Edit,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';

const ProfileScreen = () => {
  const router = useRouter();
  const { logout, user, clearUserData } = useAuth();
  const { userDetails, clearUserDetails } = useUserDetails();
  const [refreshing, setRefreshing] = useState(false);

  // Get user data from contexts
  const userData = userDetails || user || {};
  const displayName = userData.name || userData.displayName || 'User';
  const email = userData.email || 'N/A';
  const phone = userData.phone || userData.phoneNumber || 'N/A';
  const role = userData.role || 'citizen';
  const address = userData.address || {};
  const createdAt = userData.createdAt || userData.joinedDate;

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
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
            clearUserDetails();
            clearUserData();
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

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing will be available soon!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFullAddress = () => {
    if (!address || typeof address !== 'object') return 'N/A';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.citizenAccent]}
            tintColor={COLORS.citizenAccent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={48} color={COLORS.white} />
              </View>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <View style={styles.roleBadge}>
              <Shield size={14} color={COLORS.citizenPrimary} />
              <Text style={styles.roleText}>{role.toUpperCase()}</Text>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <User size={20} color={COLORS.citizenPrimary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{displayName}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Mail size={20} color={COLORS.citizenPrimary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Phone size={20} color={COLORS.citizenPrimary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{phone}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <MapPin size={20} color={COLORS.citizenPrimary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{getFullAddress()}</Text>
                </View>
              </View>

              {createdAt && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Calendar size={20} color={COLORS.citizenPrimary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Member Since</Text>
                      <Text style={styles.infoValue}>{formatDate(createdAt)}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Coming Soon', 'Change password feature coming soon!')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Shield size={20} color={COLORS.citizenPrimary} />
                </View>
                <Text style={styles.settingText}>Change Password</Text>
              </View>
              <ChevronRight size={20} color={COLORS.citizenTextGray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon!')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Mail size={20} color={COLORS.citizenPrimary} />
                </View>
                <Text style={styles.settingText}>Notification Settings</Text>
              </View>
              <ChevronRight size={20} color={COLORS.citizenTextGray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon!')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <User size={20} color={COLORS.citizenPrimary} />
                </View>
                <Text style={styles.settingText}>Privacy Settings</Text>
              </View>
              <ChevronRight size={20} color={COLORS.citizenTextGray} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.white} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Bottom Navigation removed - now handled by _layout.js */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.citizenBackground,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },

  // Header
  header: {
    backgroundColor: COLORS.citizenPrimary,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Content
  mainContent: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.citizenBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.citizenPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.citizenBackground,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.citizenPrimary,
    letterSpacing: 0.5,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.citizenTextDark,
    marginBottom: 16,
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.citizenBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.citizenTextGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.citizenTextDark,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.citizenBorder,
    marginVertical: 4,
  },

  // Settings
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.citizenBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
  },

  // Logout Button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.citizenDanger,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.citizenDanger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  bottomPadding: {
    height: 24,
  },
});

export default ProfileScreen;

