import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const RoleBadge = ({ role, count }) => {
  const roleColors = {
    admin: COLORS.roleAdmin,
    citizen: COLORS.roleCitizen,
    coordinator: COLORS.roleCoordinator,
    technician: COLORS.roleTechnician,
  };

  const roleIcons = {
    admin: '👨‍💼',
    citizen: '👥',
    coordinator: '🗺️',
    technician: '🔧',
  };

  const color = roleColors[role] || COLORS.primary;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
      <Text style={styles.icon}>{roleIcons[role] || '👤'}</Text>
      <Text style={[styles.count, { color }]}>{count}</Text>
      <Text style={[styles.role, { color }]}>{role}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.small / 2,
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default RoleBadge;

