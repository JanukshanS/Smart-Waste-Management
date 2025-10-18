import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';

/**
 * Modular Bottom Tab Navigator Component
 * 
 * Props:
 * - tabs: Array of tab objects with structure:
 *   {
 *     key: string (unique identifier),
 *     title: string (tab label),
 *     icon: React Component (Lucide icon component),
 *     route: string (expo-router path),
 *     badge: number (optional badge count)
 *   }
 * - activeColor: string (color for active tab, defaults to COLORS.primary)
 * - inactiveColor: string (color for inactive tabs, defaults to COLORS.textLight)
 * - backgroundColor: string (background color, defaults to COLORS.white)
 */
const BottomTabNavigator = ({
  tabs = [],
  activeColor = COLORS.primary,
  inactiveColor = COLORS.textLight,
  backgroundColor = COLORS.white,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (tab) => {
    if (tab.route) {
      router.push(tab.route);
    }
  };

  const isTabActive = (tab) => {
    // Get the base route path (e.g., '/coordinator' from '/coordinator/...')
    const baseRoute = '/' + pathname.split('/')[1];
    const tabBaseRoute = '/' + tab.route.split('/')[1];
    
    // Exact match for index route
    if (tab.route === baseRoute && pathname === baseRoute) {
      return true;
    }
    // For nested routes, check if pathname starts with the route
    if (tab.route !== baseRoute && pathname.startsWith(tab.route)) {
      return true;
    }
    return false;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {tabs.map((tab) => {
        const isActive = isTabActive(tab);
        const tabColor = isActive ? activeColor : inactiveColor;
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <IconComponent size={24} color={tabColor} strokeWidth={2} />
              <Text style={[styles.label, { color: tabColor }]} numberOfLines={1}>
                {tab.title}
              </Text>
              {tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            {isActive && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: Platform.OS === 'ios' ? SPACING.small + 1 : 1,
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.small,
    position: 'relative',
  },
  tabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;

