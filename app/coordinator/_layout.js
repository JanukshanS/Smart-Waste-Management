import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import { LayoutDashboard, Trash2, Route, ClipboardList, MoreHorizontal } from 'lucide-react-native';
import { BottomTabNavigator } from '../../src/components/Navigation';
import { COLORS } from '../../src/constants/theme';

/**
 * Coordinator Section Layout with Bottom Tab Navigation
 * 
 * This provides a consistent bottom navigation bar across all coordinator screens
 */
const CoordinatorLayout = () => {
  // Define coordinator navigation tabs
  const coordinatorTabs = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      route: '/coordinator',
    },
    {
      key: 'bins',
      title: 'Bins',
      icon: Trash2,
      route: '/coordinator/bin-management',
    },
    {
      key: 'routes',
      title: 'Routes',
      icon: Route,
      route: '/coordinator/routes',
    },
    {
      key: 'requests',
      title: 'Requests',
      icon: ClipboardList,
      route: '/coordinator/requests',
    },
    {
      key: 'more',
      title: 'More',
      icon: MoreHorizontal,
      route: '/coordinator/analytics',
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
            tabs={coordinatorTabs}
            activeColor={COLORS.primary}
            inactiveColor={COLORS.textLight}
            backgroundColor={COLORS.white}
            labeled={true}
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

export default CoordinatorLayout;

