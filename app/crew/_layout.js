import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import { Home, Route, ClipboardList, AlertCircle, User } from 'lucide-react-native';
import { BottomTabNavigator } from '../../src/components/Navigation';
import { COLORS } from '../../src/constants/theme';

/**
 * Crew Section Layout with Bottom Tab Navigation
 * 
 * This provides a consistent bottom navigation bar across all crew screens
 */
const CrewLayout = () => {
  // Define crew navigation tabs
  const crewTabs = [
    {
      key: 'dashboard',
      title: 'Home',
      icon: Home,
      route: '/crew',
    },
    {
      key: 'routes',
      title: 'My Routes',
      icon: Route,
      route: '/crew/my-routes',
    },
    {
      key: 'tasks',
      title: 'Tasks',
      icon: ClipboardList,
      route: '/crew/my-routes',
    },
    {
      key: 'report',
      title: 'Report',
      icon: AlertCircle,
      route: '/crew/report-issue',
    },
    {
      key: 'profile',
      title: 'Profile',
      icon: User,
      route: '/crew/profile',
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
            tabs={crewTabs}
            activeColor={COLORS.secondary}
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
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  navContainer: {
    backgroundColor: COLORS.white,
  },
});

export default CrewLayout;

