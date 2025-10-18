import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

const IssueCard = ({ issue, onPress }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#D32F2F';
      case 'high':
        return '#F57C00';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#388E3C';
      default:
        return COLORS.textLight;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return '#FFA500';
      case 'acknowledged':
        return '#2196F3';
      case 'in-progress':
        return '#9C27B0';
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return COLORS.textLight;
      default:
        return COLORS.textLight;
    }
  };

  const getIssueTypeIcon = (issueType) => {
    switch (issueType) {
      case 'blocked-access':
        return 'road-variant';
      case 'bin-damaged':
        return 'delete-alert';
      case 'bin-overflow':
        return 'package-variant';
      case 'safety-hazard':
        return 'alert-triangle';
      case 'vehicle-issue':
        return 'truck-alert';
      case 'other':
        return 'help-circle';
      default:
        return 'file-document-edit';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const priorityColor = getPriorityColor(issue.priority);
  const statusColor = getStatusColor(issue.status);
  const issueIcon = getIssueTypeIcon(issue.issueType);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <MaterialCommunityIcons 
                name={issueIcon} 
                size={28} 
                color={priorityColor} 
                style={styles.iconStyle}
              />
              <View style={styles.titleSection}>
                <Text style={styles.issueId}>{issue.issueId}</Text>
                <Text style={styles.issueType}>
                  {issue.issueType.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
              </View>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>
                {issue.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {issue.description}
          </Text>

          <View style={styles.footer}>
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={12} color={COLORS.textLight} />
                <Text style={styles.crewName}>
                  {issue.crewId?.name || 'Unknown Crew'}
                </Text>
              </View>
              {issue.location && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.textLight} />
                  <Text style={styles.location}>
                    {issue.location}
                  </Text>
                </View>
              )}
              {issue.routeId && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map" size={12} color={COLORS.textLight} />
                  <Text style={styles.routeName}>
                    {issue.routeId?.routeName || 'Route'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.rightSection}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>
                  {issue.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {formatDate(issue.reportedAt)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.small,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconStyle: {
    marginRight: SPACING.small,
  },
  titleSection: {
    flex: 1,
  },
  issueId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  issueType: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoSection: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crewName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  location: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  routeName: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.white,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});

export default IssueCard;

