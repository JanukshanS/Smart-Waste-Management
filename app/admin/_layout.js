import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slot } from 'expo-router';
import { LayoutDashboard, Users, FileText, Trash } from "lucide-react-native";
import { BottomTabNavigator } from '../../src/components/Navigation';
import { COLORS } from '../../src/constants/theme';

/**
 * Admin Section Layout with Bottom Tab Navigation
 * 
 * This provides a consistent bottom navigation bar across all admin screens
 */
const AdminLayout = () => {
  // Define admin navigation tabs
  const adminTabs = [
    {
      key: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      route: "/admin",
    },
    {
      key: "users",
      title: "Users",
      icon: Users,
      route: "/admin/users",
    },
    {
      key: "reports",
      title: "Reports",
      icon: FileText,
      route: "/admin/reports",
    },
    {
      key: "bins",
      title: "Bins",
      icon: Trash,
      route: "/admin/bins",
    },
    // {
    //   key: 'settings',
    //   title: 'Settings',
    //   icon: Settings,
    //   route: '/admin/privacy-settings',
    // },
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
            tabs={adminTabs}
            activeColor={COLORS.roleAdmin}
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

export default AdminLayout;

