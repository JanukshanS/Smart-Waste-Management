import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Home, 
  ClipboardList, 
  MapPin, 
  User, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CitizenMenu = ({ currentScreen = 'dashboard' }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const slideAnim = new Animated.Value(-SCREEN_WIDTH);

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      route: '/citizen/dashboard',
      description: 'Overview and quick actions'
    },
    {
      id: 'my-requests',
      title: 'My Requests',
      icon: ClipboardList,
      route: '/citizen/my-requests',
      description: 'View and manage your requests'
    },
    {
      id: 'find-bins',
      title: 'Find Bins',
      icon: MapPin,
      route: '/citizen/find-bins',
      description: 'Locate nearby waste bins'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      route: '/citizen/profile',
      description: 'Manage your account'
    }
  ];

  const showMenu = () => {
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const handleMenuPress = (item) => {
    hideMenu();
    if (item.route !== currentScreen) {
      router.push(item.route);
    }
  };

  const getCurrentScreenTitle = () => {
    const currentItem = menuItems.find(item => item.id === currentScreen);
    return currentItem ? currentItem.title : 'Citizen Portal';
  };

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={showMenu}
        activeOpacity={0.8}
      >
        <Menu size={24} color={COLORS.white} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideMenu}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
        
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={hideMenu}
        />

        {/* Menu Panel */}
        <Animated.View 
          style={[
            styles.menuPanel,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.menuHeader}>
            <View style={styles.menuHeaderContent}>
              <Text style={styles.menuTitle}>Citizen Portal</Text>
              <Text style={styles.menuSubtitle}>Smart Waste Management</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={hideMenu}
              activeOpacity={0.8}
            >
              <X size={24} color={COLORS.citizenTextDark} />
            </TouchableOpacity>
          </View>

          {/* Current Screen Indicator */}
          <View style={styles.currentScreenIndicator}>
            <Text style={styles.currentScreenText}>
              Currently viewing: {getCurrentScreenTitle()}
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.id === currentScreen;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isActive && styles.menuItemActive
                  ]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[
                      styles.menuItemIcon,
                      isActive && styles.menuItemIconActive
                    ]}>
                      <IconComponent 
                        size={24} 
                        color={isActive ? COLORS.white : COLORS.citizenPrimary} 
                      />
                    </View>
                    <View style={styles.menuItemContent}>
                      <Text style={[
                        styles.menuItemTitle,
                        isActive && styles.menuItemTitleActive
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={[
                        styles.menuItemDescription,
                        isActive && styles.menuItemDescriptionActive
                      ]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight 
                    size={20} 
                    color={isActive ? COLORS.white : COLORS.citizenTextGray} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.menuFooter}>
            <Text style={styles.menuFooterText}>
              Smart Waste Management System
            </Text>
            <Text style={styles.menuFooterSubtext}>
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.citizenPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.85,
    height: '100%',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingTop: 60,
    paddingBottom: SPACING.large,
    backgroundColor: COLORS.citizenBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.citizenBorder,
  },
  menuHeaderContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.citizenTextDark,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.citizenTextGray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.citizenBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.citizenBorder,
  },
  currentScreenIndicator: {
    backgroundColor: COLORS.citizenPrimary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
  },
  currentScreenText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: SPACING.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.small,
    borderRadius: 12,
    backgroundColor: COLORS.citizenBackground,
    borderWidth: 1,
    borderColor: COLORS.citizenBorder,
  },
  menuItemActive: {
    backgroundColor: COLORS.citizenPrimary,
    borderColor: COLORS.citizenPrimary,
    shadowColor: COLORS.citizenPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.citizenBorder,
  },
  menuItemIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
    marginBottom: 2,
  },
  menuItemTitleActive: {
    color: COLORS.white,
  },
  menuItemDescription: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
    lineHeight: 16,
  },
  menuItemDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuFooter: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.large,
    backgroundColor: COLORS.citizenBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.citizenBorder,
    alignItems: 'center',
  },
  menuFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.citizenTextDark,
    marginBottom: 2,
  },
  menuFooterSubtext: {
    fontSize: 12,
    color: COLORS.citizenTextGray,
  },
});

export default CitizenMenu;
