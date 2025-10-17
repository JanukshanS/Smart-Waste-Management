import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';

const TechnicianDashboardScreen = () => {
  const router = useRouter();
  const { logout } = useAuth();

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

  return (
    <View style={styles.container}>
      <DashboardHeader 
        title="Technician Dashboard"
        subtitle="Device Maintenance & Repairs"
        rightComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.buttonContainer}>
        <Button 
          title="Work Orders" 
          onPress={() => router.push('/technician/work-orders')}
        />
        
        <Button 
          title="Device Management" 
          onPress={() => router.push('/technician/devices')}
        />
        
        <Button 
          title="Register Device" 
          onPress={() => router.push('/technician/register-device')}
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
  content: {
    flex: 1,
    padding: SPACING.large,
  },
  buttonContainer: {
    gap: SPACING.medium,
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

export default TechnicianDashboardScreen;

