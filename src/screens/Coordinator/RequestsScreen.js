import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Portal, Dialog, Button as PaperButton, TextInput, Chip } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { RequestCard } from '../../components/Coordinator';

const RequestsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Reject dialog state
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getPendingRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = (request) => {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve request ${request.trackingId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => confirmApprove(request._id),
          style: 'default'
        },
      ]
    );
  };

  const confirmApprove = async (requestId) => {
    try {
      setProcessing(true);
      const response = await coordinatorApi.approveRequest(requestId);
      if (response.success) {
        Alert.alert('Success', 'Request approved successfully');
        // Remove from list
        setRequests(requests.filter(r => r._id !== requestId));
      }
    } catch (err) {
      console.error('Error approving request:', err);
      Alert.alert('Error', err.message || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      const response = await coordinatorApi.rejectRequest(selectedRequest._id, rejectionReason);
      if (response.success) {
        Alert.alert('Success', 'Request rejected successfully');
        // Remove from list
        setRequests(requests.filter(r => r._id !== selectedRequest._id));
        setRejectDialogVisible(false);
        setSelectedRequest(null);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      Alert.alert('Error', err.message || 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const setCommonReason = (reason) => {
    setRejectionReason(reason);
  };

  const renderRequest = ({ item }) => (
    <RequestCard 
      request={item} 
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Requests</Text>
        <Text style={styles.subtitle}>
          {requests.length} pending request{requests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Requests List */}
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item._id || item.trackingId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubtext}>All requests have been processed</Text>
          </View>
        }
      />

      {/* Reject Dialog */}
      <Portal>
        <Dialog 
          visible={rejectDialogVisible} 
          onDismiss={() => !processing && setRejectDialogVisible(false)}
        >
          <Dialog.Title>Reject Request</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Request: {selectedRequest?.trackingId}
            </Text>
            <Text style={styles.dialogLabel}>Reason for rejection:</Text>
            
            {/* Common Reasons */}
            <View style={styles.reasonChipsContainer}>
              <Chip
                mode="outlined"
                onPress={() => setCommonReason('Invalid address')}
                style={styles.reasonChip}
              >
                Invalid address
              </Chip>
              <Chip
                mode="outlined"
                onPress={() => setCommonReason('Unsupported waste type')}
                style={styles.reasonChip}
              >
                Unsupported waste type
              </Chip>
              <Chip
                mode="outlined"
                onPress={() => setCommonReason('Duplicate request')}
                style={styles.reasonChip}
              >
                Duplicate request
              </Chip>
              <Chip
                mode="outlined"
                onPress={() => setCommonReason('Incomplete information')}
                style={styles.reasonChip}
              >
                Incomplete info
              </Chip>
            </View>

            <TextInput
              mode="outlined"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={3}
              style={styles.reasonInput}
              disabled={processing}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton 
              onPress={() => setRejectDialogVisible(false)}
              disabled={processing}
            >
              Cancel
            </PaperButton>
            <PaperButton 
              onPress={confirmReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Rejecting...' : 'Reject'}
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.large,
    paddingBottom: SPACING.small,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    marginHorizontal: SPACING.large,
    borderRadius: 8,
    marginBottom: SPACING.medium,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.large,
  },
  emptyContainer: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  dialogText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  dialogLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  reasonChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  reasonChip: {
    marginBottom: SPACING.small,
  },
  reasonInput: {
    backgroundColor: COLORS.white,
  },
});

export default RequestsScreen;

