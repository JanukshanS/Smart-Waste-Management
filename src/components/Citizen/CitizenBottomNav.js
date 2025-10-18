import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  Home, 
  ClipboardList, 
  MapPin, 
  User, 
  Plus
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CitizenBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      route: '/citizen/',
    },
    {
      id: 'my-requests',
      title: 'Requests',
      icon: ClipboardList,
      route: '/citizen/my-requests',
    },
    {
      id: 'create-request',
      title: 'Create',
      icon: Plus,
      route: '/citizen/create-request',
      isSpecial: true,
    },
    {
      id: 'find-bins',
      title: 'Find Bins',
      icon: MapPin,
      route: '/citizen/find-bins',
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      route: '/citizen/profile',
    }
  ];

  const isActive = (route) => {
    if (route === '/citizen/') {
      return pathname === '/citizen/' || pathname === '/citizen';
    }
    return pathname === route;
  };

  const handleNavPress = (item) => {
    if (!isActive(item.route)) {
      router.push(item.route);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.route);
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                active && styles.navItemActive,
                item.isSpecial && styles.navItemSpecial,
                active && item.isSpecial && styles.navItemSpecialActive
              ]}
              onPress={() => handleNavPress(item)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.navIconContainer,
                active && styles.navIconContainerActive,
                item.isSpecial && styles.navIconContainerSpecial,
                active && item.isSpecial && styles.navIconContainerSpecialActive
              ]}>
                <IconComponent 
                  size={item.isSpecial ? 28 : 22} 
                  color={
                    active 
                      ? COLORS.white
                      : (item.isSpecial ? COLORS.white : COLORS.citizenTextGray)
                  } 
                />
              </View>
              <Text style={[
                styles.navLabel,
                active && styles.navLabelActive,
                item.isSpecial && styles.navLabelSpecial,
                active && styles.navLabelWhite
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.citizenBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    paddingBottom: 8, // For devices with home indicator
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingTop: SPACING.small,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.small / 2,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  navItemActive: {
    backgroundColor: COLORS.citizenPrimary,
  },
  navItemSpecial: {
    backgroundColor: COLORS.citizenPrimary,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navItemSpecialActive: {
    backgroundColor: COLORS.citizenPrimary,
    shadowOpacity: 0.4,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navIconContainerSpecial: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  navIconContainerSpecialActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.citizenTextGray,
    textAlign: 'center',
  },
  navLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  navLabelSpecial: {
    color: COLORS.white,
    fontWeight: '700',
  },
  navLabelWhite: {
    color: COLORS.white,
    fontWeight: '700',
  },
});

export default CitizenBottomNav;
