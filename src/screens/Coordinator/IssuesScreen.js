import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Portal,
  Dialog,
  TextInput,
  RadioButton,
  Chip,
  Button as PaperButton,
} from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { coordinatorApi } from '../../api';
import { IssueCard } from '../../components/Coordinator';
import { useAuth } from '../../contexts/AuthContext';

const IssuesScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');

  // Dialog states
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [commentDialogVisible, setCommentDialogVisible] = useState(false);
  const [priorityDialogVisible, setPriorityDialogVisible] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [comment, setComment] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [issues, activeStatusFilter, activePriorityFilter, activeTypeFilter]);

  const fetchIssues = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getIssues({ sort: 'reportedAt:desc' });
      if (response.success) {
        setIssues(response.data);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to load issues');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.status === activeStatusFilter);
    }

    if (activePriorityFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.priority === activePriorityFilter);
    }

    if (activeTypeFilter !== 'all') {
      filtered = filtered.filter((issue) => issue.issueType === activeTypeFilter);
    }

    setFilteredIssues(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const handleIssuePress = (issue) => {
    setSelectedIssue(issue);
    setDetailsDialogVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    if (newStatus === 'resolved' && !resolution.trim()) {
      Alert.alert('Error', 'Please provide a resolution description');
      return;
    }

    try {
      setProcessing(true);
      const statusData = {
        status: newStatus,
      };

      if (newStatus === 'resolved') {
        statusData.resolvedBy = user?.id || user?._id;
        statusData.resolution = resolution.trim();
      }

      const response = await coordinatorApi.updateIssueStatus(selectedIssue._id, statusData);
      
      if (response.success) {
        Alert.alert('Success', 'Issue status updated successfully');
        setStatusDialogVisible(false);
        setNewStatus('');
        setResolution('');
        setDetailsDialogVisible(false);
        fetchIssues();
      }
    } catch (err) {
      console.error('Error updating issue status:', err);
      Alert.alert('Error', err.message || 'Failed to update issue status');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdatePriority = async () => {
    if (!newPriority) {
      Alert.alert('Error', 'Please select a priority');
      return;
    }

    try {
      setProcessing(true);
      const response = await coordinatorApi.updateIssuePriority(selectedIssue._id, newPriority);
      
      if (response.success) {
        Alert.alert('Success', 'Issue priority updated successfully');
        setPriorityDialogVisible(false);
        setNewPriority('');
        setDetailsDialogVisible(false);
        fetchIssues();
      }
    } catch (err) {
      console.error('Error updating issue priority:', err);
      Alert.alert('Error', err.message || 'Failed to update issue priority');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setProcessing(true);
      const userId = user?.id || user?._id;
      const response = await coordinatorApi.addIssueComment(selectedIssue._id, {
        userId,
        comment: comment.trim(),
      });
      
      if (response.success) {
        Alert.alert('Success', 'Comment added successfully');
        setCommentDialogVisible(false);
        setComment('');
        // Refresh issue details
        const issueResponse = await coordinatorApi.getIssueById(selectedIssue._id);
        if (issueResponse.success) {
          setSelectedIssue(issueResponse.data);
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Error', err.message || 'Failed to add comment');
    } finally {
      setProcessing(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading issues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {/* Status Filters */}
          <Chip
            selected={activeStatusFilter === 'all'}
            onPress={() => setActiveStatusFilter('all')}
            style={styles.filterChip}
          >
            All Status
          </Chip>
          <Chip
            selected={activeStatusFilter === 'reported'}
            onPress={() => setActiveStatusFilter('reported')}
            style={styles.filterChip}
          >
            Reported
          </Chip>
          <Chip
            selected={activeStatusFilter === 'in-progress'}
            onPress={() => setActiveStatusFilter('in-progress')}
            style={styles.filterChip}
          >
            In Progress
          </Chip>
          <Chip
            selected={activeStatusFilter === 'resolved'}
            onPress={() => setActiveStatusFilter('resolved')}
            style={styles.filterChip}
          >
            Resolved
          </Chip>

          {/* Priority Filters */}
          <View style={styles.filterDivider} />
          <Chip
            selected={activePriorityFilter === 'critical'}
            onPress={() => setActivePriorityFilter(activePriorityFilter === 'critical' ? 'all' : 'critical')}
            style={[styles.filterChip, { backgroundColor: activePriorityFilter === 'critical' ? '#D32F2F' : undefined }]}
            textStyle={{ color: activePriorityFilter === 'critical' ? COLORS.white : undefined }}
          >
            Critical
          </Chip>
          <Chip
            selected={activePriorityFilter === 'high'}
            onPress={() => setActivePriorityFilter(activePriorityFilter === 'high' ? 'all' : 'high')}
            style={styles.filterChip}
          >
            High
          </Chip>
        </ScrollView>
      </View>

      {/* Issues List */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredIssues}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <IssueCard issue={item} onPress={() => handleIssuePress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No issues found</Text>
            <Text style={styles.emptySubtext}>
              {activeStatusFilter !== 'all' || activePriorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'All issues will appear here'}
            </Text>
          </View>
        }
      />

      {/* Issue Details Dialog */}
      <Portal>
        <Dialog
          visible={detailsDialogVisible}
          onDismiss={() => setDetailsDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Issue Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              {selectedIssue && (
                <View style={styles.dialogContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue ID:</Text>
                    <Text style={styles.detailValue}>{selectedIssue.issueId}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                      {selectedIssue.issueType.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Priority:</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedIssue.priority) }]}>
                      <Text style={styles.priorityText}>{selectedIssue.priority.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedIssue.status) }]}>
                      <Text style={styles.statusText}>{selectedIssue.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailDescription}>{selectedIssue.description}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reported by:</Text>
                    <Text style={styles.detailValue}>{selectedIssue.crewId?.name || 'Unknown'}</Text>
                  </View>

                  {selectedIssue.location && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>{selectedIssue.location}</Text>
                    </View>
                  )}

                  {selectedIssue.routeId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Route:</Text>
                      <Text style={styles.detailValue}>{selectedIssue.routeId?.routeName || 'N/A'}</Text>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reported:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedIssue.reportedAt).toLocaleString()}
                    </Text>
                  </View>

                  {selectedIssue.resolution && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Resolution:</Text>
                      <Text style={styles.detailDescription}>{selectedIssue.resolution}</Text>
                    </View>
                  )}

                  {selectedIssue.comments && selectedIssue.comments.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Comments ({selectedIssue.comments.length}):</Text>
                      {selectedIssue.comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                          <Text style={styles.commentUser}>{comment.userId?.name || 'User'}</Text>
                          <Text style={styles.commentText}>{comment.comment}</Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.createdAt).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={styles.dialogActions}>
            <PaperButton onPress={() => setPriorityDialogVisible(true)}>
              Change Priority
            </PaperButton>
            <PaperButton onPress={() => setCommentDialogVisible(true)}>
              Add Comment
            </PaperButton>
            <PaperButton onPress={() => {
              setNewStatus(selectedIssue?.status || '');
              setStatusDialogVisible(true);
            }}>
              Update Status
            </PaperButton>
            <PaperButton onPress={() => setDetailsDialogVisible(false)}>
              Close
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Status Update Dialog */}
      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Update Status</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setNewStatus} value={newStatus}>
              <View style={styles.radioItem}>
                <RadioButton value="reported" />
                <Text style={styles.radioLabel}>Reported</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="acknowledged" />
                <Text style={styles.radioLabel}>Acknowledged</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="in-progress" />
                <Text style={styles.radioLabel}>In Progress</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="resolved" />
                <Text style={styles.radioLabel}>Resolved</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="closed" />
                <Text style={styles.radioLabel}>Closed</Text>
              </View>
            </RadioButton.Group>

            {newStatus === 'resolved' && (
              <TextInput
                mode="outlined"
                label="Resolution *"
                placeholder="Describe how this issue was resolved..."
                value={resolution}
                onChangeText={setResolution}
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setStatusDialogVisible(false)} disabled={processing}>
              Cancel
            </PaperButton>
            <PaperButton onPress={handleUpdateStatus} disabled={processing}>
              {processing ? 'Updating...' : 'Update'}
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Priority Update Dialog */}
      <Portal>
        <Dialog visible={priorityDialogVisible} onDismiss={() => setPriorityDialogVisible(false)}>
          <Dialog.Title>Update Priority</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setNewPriority} value={newPriority}>
              <View style={styles.radioItem}>
                <RadioButton value="low" />
                <Text style={styles.radioLabel}>Low</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="medium" />
                <Text style={styles.radioLabel}>Medium</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="high" />
                <Text style={styles.radioLabel}>High</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="critical" />
                <Text style={styles.radioLabel}>Critical</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setPriorityDialogVisible(false)} disabled={processing}>
              Cancel
            </PaperButton>
            <PaperButton onPress={handleUpdatePriority} disabled={processing}>
              {processing ? 'Updating...' : 'Update'}
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Comment Dialog */}
      <Portal>
        <Dialog visible={commentDialogVisible} onDismiss={() => setCommentDialogVisible(false)}>
          <Dialog.Title>Add Comment</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Comment"
              placeholder="Add your comment..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={styles.textInput}
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setCommentDialogVisible(false)} disabled={processing}>
              Cancel
            </PaperButton>
            <PaperButton onPress={handleAddComment} disabled={processing}>
              {processing ? 'Adding...' : 'Add'}
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
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  filtersSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersScroll: {
    paddingHorizontal: SPACING.medium,
  },
  filterChip: {
    marginRight: SPACING.small,
  },
  filterDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: SPACING.small,
  },
  listContent: {
    padding: SPACING.large,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.medium,
    marginHorizontal: SPACING.large,
    marginTop: SPACING.medium,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.large * 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.medium,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogScroll: {
    maxHeight: 400,
  },
  dialogContent: {
    padding: SPACING.small,
  },
  dialogActions: {
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  detailSection: {
    marginBottom: SPACING.medium,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  detailDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
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
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  commentItem: {
    backgroundColor: '#F5F5F5',
    padding: SPACING.small,
    borderRadius: 8,
    marginTop: SPACING.small,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  radioLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SPACING.small,
  },
  textInput: {
    marginTop: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default IssuesScreen;

