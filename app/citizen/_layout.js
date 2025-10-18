import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import { Home, Plus, MapPin, ClipboardList, User } from 'lucide-react-native';
import { BottomTabNavigator } from '../../src/components/Navigation';
import { COLORS } from '../../src/constants/theme';

/**
 * Citizen Section Layout with Bottom Tab Navigation
 * 
 * This provides a consistent bottom navigation bar across all citizen screens
 */
const CitizenLayout = () => {
  // Define citizen navigation tabs
  const citizenTabs = [
    {
      key: 'dashboard',
      title: 'Home',
      icon: Home,
      route: '/citizen',
    },
    {
      key: 'create',
      title: 'Create',
      icon: Plus,
      route: '/citizen/create-request',
    },
    {
      key: 'bins',
      title: 'Find Bins',
      icon: MapPin,
      route: '/citizen/find-bins',
    },
    {
      key: 'requests',
      title: 'Requests',
      icon: ClipboardList,
      route: '/citizen/my-requests',
    },
    {
      key: 'profile',
      title: 'Profile',
      icon: User,
      route: '/citizen/profile',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Main content area - This will take all available space above the nav bar */}
        <View style={styles.content}>
          <Slot />
        </View>
        
        {/* Bottom Tab Navigation - Fixed at bottom */}
        <View style={styles.navContainer}>
          <BottomTabNavigator
            tabs={citizenTabs}
            activeColor={COLORS.citizenPrimary}
            inactiveColor={COLORS.textLight}
            backgroundColor={COLORS.white}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.citizenBackground,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  navContainer: {
    backgroundColor: COLORS.white,
  },
});

export default CitizenLayout;

