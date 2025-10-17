import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { crewApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';

const ReportIssueScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { userDetails } = useUserDetails();
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const issueTypes = [
    { id: 'bin-damaged', label: '🗑️ Damaged Bin', icon: '🗑️' },
    { id: 'bin-inaccessible', label: '🚧 Inaccessible Bin', icon: '🚧' },
    { id: 'hazard', label: '⚠️ Safety Hazard', icon: '⚠️' },
    { id: 'vehicle-issue', label: '🚛 Vehicle Problem', icon: '🚛' },
    { id: 'overflow', label: '📦 Overflow', icon: '📦' },
    { id: 'other', label: '❓ Other Issue', icon: '❓' },
  ];

  const handleSubmit = async () => {
    if (!issueType) {
      Alert.alert('Error', 'Please select an issue type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    try {
      setLoading(true);

      const userId = userDetails?.id || userDetails?._id || user?.id || user?._id;
      
      const issueData = {
        crewId: userId,
        issueType: issueType,
        description: description.trim(),
        location: location.trim() || 'Not specified',
        reportedAt: new Date().toISOString(),
      };

      const response = await crewApi.reportIssue(issueData);

      if (response.success) {
        Alert.alert('Success', 'Issue reported successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      Alert.alert('Error', 'Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Report Issue</Text>
        </View>

        {/* Issue Type Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Issue Type *</Text>
          <View style={styles.issueTypesGrid}>
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.issueTypeCard,
                  issueType === type.id && styles.issueTypeCardActive,
                ]}
                onPress={() => setIssueType(type.id)}
              >
                <Text style={styles.issueTypeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.issueTypeLabel,
                    issueType === type.id && styles.issueTypeLabelActive,
                  ]}
                >
                  {type.label.replace(/^[^\s]+ /, '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location or address"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.hint}>e.g., "Main St & 5th Ave" or "Bin #123"</Text>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Reporting Tips</Text>
          <Text style={styles.helpText}>
            • Select the most appropriate issue type{'\n'}
            • Provide detailed description of the problem{'\n'}
            • Include bin ID or location if applicable{'\n'}
            • Report safety hazards immediately
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.medium,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    padding: SPACING.large,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  issueTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.medium,
  },
  issueTypeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.small,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  issueTypeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  issueTypeIcon: {
    fontSize: 32,
    marginBottom: SPACING.small,
  },
  issueTypeLabel: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  issueTypeLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 150,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    margin: SPACING.large,
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
});

export default ReportIssueScreen;

