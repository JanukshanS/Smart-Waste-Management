import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Button as PaperButton } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const RequestCard = ({ request, onApprove, onReject, onPress }) => {
  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'approved':
        return '#4CAF50';
      case 'rejected':
        return COLORS.error;
      case 'completed':
        return COLORS.primary;
      default:
        return COLORS.textLight;
    }
  };

  // Determine waste type color
  const getWasteTypeColor = (wasteType) => {
    switch (wasteType) {
      case 'household':
        return '#4CAF50';
      case 'bulky':
        return '#FF5722';
      case 'e-waste':
        return '#9C27B0';
      case 'recyclable':
        return '#2196F3';
      default:
        return COLORS.primary;
    }
  };

  const statusColor = getStatusColor(request.status);
  const wasteTypeColor = getWasteTypeColor(request.wasteType);
  const isPending = request.status === 'pending';

  return (
    <TouchableOpacity onPress={() => onPress?.(request)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.trackingId}>{request.trackingId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{request.status?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={[styles.wasteTypeBadge, { backgroundColor: wasteTypeColor }]}>
            <Text style={styles.wasteTypeText}>{request.wasteType?.toUpperCase()}</Text>
          </View>

          <Text style={styles.quantity}>Quantity: {request.quantity}</Text>

          <Text style={styles.address} numberOfLines={2}>
            📍 {request.address?.street || 'Unknown Address'}
          </Text>

          {request.preferredDate && (
            <Text style={styles.date}>
              Preferred Date: {new Date(request.preferredDate).toLocaleDateString()}
            </Text>
          )}

          {request.description && (
            <Text style={styles.description} numberOfLines={2}>
              {request.description}
            </Text>
          )}

          {isPending && (
            <View style={styles.actions}>
              <PaperButton
                mode="contained"
                onPress={() => onApprove?.(request)}
                style={[styles.button, styles.approveButton]}
                labelStyle={styles.buttonLabel}
                icon="check"
              >
                Approve
              </PaperButton>
              <PaperButton
                mode="outlined"
                onPress={() => onReject?.(request)}
                style={[styles.button, styles.rejectButton]}
                labelStyle={styles.rejectLabel}
                icon="close"
              >
                Reject
              </PaperButton>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  trackingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  wasteTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: SPACING.small,
  },
  wasteTypeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  quantity: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  address: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: SPACING.small,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.medium,
    gap: SPACING.small,
  },
  button: {
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    borderColor: COLORS.error,
  },
  buttonLabel: {
    fontSize: 13,
  },
  rejectLabel: {
    color: COLORS.error,
    fontSize: 13,
  },
});

export default RequestCard;

