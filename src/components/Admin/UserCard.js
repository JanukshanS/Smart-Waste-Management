import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const UserCard = ({ user, onPress }) => {
  const roleColors = {
    admin: COLORS.roleAdmin,
    citizen: COLORS.roleCitizen,
    coordinator: COLORS.roleCoordinator,
    technician: COLORS.roleTechnician,
  };

  const roleIcons = {
    admin: '👨‍💼',
    citizen: '👤',
    coordinator: '🗺️',
    technician: '🔧',
  };

  const statusColors = {
    active: COLORS.success,
    inactive: COLORS.gray,
    suspended: COLORS.danger,
  };

  const roleColor = roleColors[user.role] || COLORS.primary;
  const statusColor = statusColors[user.status] || COLORS.gray;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
        </View>

        <View style={styles.badges}>
          <View style={[styles.roleBadge, { backgroundColor: `${roleColor}15`, borderColor: roleColor }]}>
            <Text style={styles.roleIcon}>{roleIcons[user.role] || '👤'}</Text>
            <Text style={[styles.roleText, { color: roleColor }]}>
              {user.role}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {user.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  avatar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  badges: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: SPACING.small / 2,
  },
  roleIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default UserCard;

