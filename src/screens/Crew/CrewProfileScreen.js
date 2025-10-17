import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, TextInput, Button as PaperButton } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { crewApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';

const CrewProfileScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userDetails } = useUserDetails();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState('available');
  const [error, setError] = useState(null);

  const availabilityOptions = [
    { value: 'available', label: 'Available', color: '#4CAF50' },
    { value: 'unavailable', label: 'Unavailable', color: '#FF9800' },
    { value: 'on-leave', label: 'On Leave', color: '#F44336' },
  ];

  const fetchProfile = async () => {
    try {
      const userId = userDetails?.id || userDetails?._id || user?.id || user?._id;
      if (!userId) return;

      const response = await crewApi.getProfile(userId);
      if (response.success) {
        setProfile(response.data);
        setAvailability(response.data.profile?.availability || 'available');
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (newAvailability) => {
    try {
      setUpdating(true);
      const response = await crewApi.updateAvailability(user._id, newAvailability);
      
      if (response.success) {
        setAvailability(newAvailability);
        Alert.alert('Success', 'Availability updated successfully');
        // Refresh profile data
        await fetchProfile();
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      Alert.alert('Error', 'Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProfile} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{profile?.crew?.name || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{profile?.crew?.email || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{profile?.crew?.phone || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Role:</Text>
              <Text style={styles.value}>Crew Member</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Work Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Work Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Vehicle ID:</Text>
              <Text style={styles.value}>{profile?.profile?.vehicleId || 'Not assigned'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Current Status:</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: availabilityOptions.find(opt => opt.value === availability)?.color || COLORS.textLight }
              ]}>
                <Text style={styles.statusText}>
                  {availabilityOptions.find(opt => opt.value === availability)?.label || availability}
                </Text>
              </View>
            </View>
            
            {profile?.currentRoute && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Current Route:</Text>
                <Text style={styles.value}>{profile.currentRoute.name}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Availability Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Update Availability</Text>
            
            {availabilityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.availabilityOption,
                  availability === option.value && styles.selectedOption
                ]}
                onPress={() => updateAvailability(option.value)}
                disabled={updating}
              >
                <View style={[styles.optionIndicator, { backgroundColor: option.color }]} />
                <Text style={[
                  styles.optionText,
                  availability === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                {availability === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            
            {updating && (
              <View style={styles.updatingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.updatingText}>Updating...</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Statistics */}
        {profile?.routeHistory && profile.routeHistory.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              
              {profile.routeHistory.slice(0, 5).map((route, index) => (
                <View key={index} style={styles.activityItem}>
                  <Text style={styles.activityRoute}>{route.routeName}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(route.scheduledDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.activityCompletion}>
                    {route.completionPercentage || 0}% complete
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <PaperButton
              mode="outlined"
              onPress={handleLogout}
              style={styles.logoutButton}
              textColor={COLORS.error}
            >
              Logout
            </PaperButton>
          </Card.Content>
        </Card>
      </ScrollView>
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
    backgroundColor: '#F5F7FA',
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
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: SPACING.medium,
  },
  card: {
    marginBottom: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 16,
    color: COLORS.textLight,
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  availabilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
    borderRadius: 8,
    marginBottom: SPACING.small,
    backgroundColor: '#F8F9FA',
  },
  selectedOption: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.medium,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  updatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.medium,
  },
  updatingText: {
    marginLeft: SPACING.small,
    color: COLORS.textLight,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityRoute: {
    fontSize: 14,
    color: COLORS.text,
    flex: 2,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'center',
  },
  activityCompletion: {
    fontSize: 12,
    color: COLORS.primary,
    flex: 1,
    textAlign: 'right',
  },
  logoutButton: {
    borderColor: COLORS.error,
    marginTop: SPACING.small,
  },
  loadingText: {
    marginTop: SPACING.small,
    color: COLORS.textLight,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: SPACING.medium,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default CrewProfileScreen;
