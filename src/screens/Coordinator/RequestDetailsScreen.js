import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Image, Alert } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import Button from '../../components/Button';

const RequestDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      setError(null);
      // Fetch all pending requests and find the one with matching ID
      const response = await coordinatorApi.getPendingRequests();
      if (response.success) {
        const foundRequest = response.data.find(r => r._id === id);
        if (foundRequest) {
          setRequest(foundRequest);
        } else {
          setError('Request not found');
        }
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequestDetails();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to approve request ${request.trackingId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: confirmApprove,
          style: 'default'
        },
      ]
    );
  };

  const confirmApprove = async () => {
    try {
      setProcessing(true);
      const response = await coordinatorApi.approveRequest(request._id);
      if (response.success) {
        Alert.alert('Success', 'Request approved successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      console.error('Error approving request:', err);
      Alert.alert('Error', err.message || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    // Navigate to reject screen or show reject dialog
    Alert.alert(
      'Reject Request',
      'Please provide a reason for rejection',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Enter Reason',
          onPress: () => {
            // In a real app, this would open a dialog with text input
            // For now, we'll just navigate back to requests screen
            router.push('/coordinator/requests');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Request not found'}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{request.trackingId}</Text>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(request.status) }]}
            textStyle={styles.statusText}
          >
            {request.status?.toUpperCase()}
          </Chip>
        </View>

        {/* Requester Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Requester Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{request.userId?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{request.userId?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{request.userId?.phone || 'N/A'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Waste Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Waste Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Waste Type:</Text>
              <Text style={styles.infoValue}>{request.wasteType || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quantity:</Text>
              <Text style={styles.infoValue}>
                {request.quantity ? `${request.quantity} kg` : 'Not specified'}
              </Text>
            </View>
            {request.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.infoLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{request.description}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Pickup Location */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Pickup Location</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{request.address || 'N/A'}</Text>
            </View>
            {request.location?.coordinates && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Coordinates:</Text>
                <Text style={styles.infoValue}>
                  {request.location.coordinates.lat?.toFixed(6)}, {request.location.coordinates.lng?.toFixed(6)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Scheduling */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Schedule Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Preferred Date:</Text>
              <Text style={styles.infoValue}>{formatDate(request.preferredDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Request Date:</Text>
              <Text style={styles.infoValue}>{formatDate(request.createdAt)}</Text>
            </View>
            {request.approvedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Approved Date:</Text>
                <Text style={styles.infoValue}>{formatDate(request.approvedAt)}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Photos */}
        {request.photos && request.photos.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Photos</Text>
              <View style={styles.photosContainer}>
                {request.photos.map((photo, index) => (
                  <Image 
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Rejection Information */}
        {request.status === 'rejected' && request.rejectionReason && (
          <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: COLORS.error }]}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: COLORS.error }]}>Rejection Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reason:</Text>
                <Text style={styles.infoValue}>{request.rejectionReason}</Text>
              </View>
              {request.rejectedAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Rejected Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(request.rejectedAt)}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        {request.status === 'pending' && (
          <View style={styles.buttonContainer}>
            <Button 
              title="Approve Request" 
              onPress={handleApprove}
              disabled={processing}
            />
            <Button 
              title="Reject Request" 
              onPress={handleReject}
              disabled={processing}
              variant="secondary"
            />
          </View>
        )}

        {request.status === 'approved' && (
          <View style={styles.buttonContainer}>
            <Button 
              title="Add to Route" 
              onPress={() => router.push('/coordinator/create-route')}
            />
          </View>
        )}
      </View>
    </ScrollView>
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
    padding: SPACING.large,
  },
  content: {
    padding: SPACING.large,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusChip: {
    marginLeft: SPACING.small,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.large,
  },
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.small,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
    width: 130,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: SPACING.small,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: SPACING.small,
    lineHeight: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  buttonContainer: {
    gap: SPACING.medium,
    marginTop: SPACING.large,
    marginBottom: SPACING.large,
  },
});

export default RequestDetailsScreen;

