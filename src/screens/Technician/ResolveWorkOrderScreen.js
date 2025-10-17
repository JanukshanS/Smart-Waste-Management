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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { technicianApi } from '../../api';

const ResolveWorkOrderScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [actionTaken, setActionTaken] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [loading, setLoading] = useState(false);

  const actions = [
    { id: 'repaired', label: '🔧 Repaired', description: 'Device was repaired' },
    { id: 'replaced', label: '🔄 Replaced', description: 'Device was replaced with new one' },
  ];

  const handleSubmit = async () => {
    if (!actionTaken) {
      Alert.alert('Error', 'Please select an action');
      return;
    }

    if (!resolutionNotes.trim()) {
      Alert.alert('Error', 'Please provide resolution notes');
      return;
    }

    if (actionTaken === 'replaced' && !newDeviceId.trim()) {
      Alert.alert('Error', 'Please provide new device ID for replacement');
      return;
    }

    try {
      setLoading(true);

      const resolutionData = {
        actionTaken,
        resolutionNotes: resolutionNotes.trim(),
        ...(actionTaken === 'replaced' && { newDeviceId: newDeviceId.trim() }),
      };

      const response = await technicianApi.resolveWorkOrder(id, resolutionData);

      if (response.success) {
        Alert.alert('Success', 'Work order resolved successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error resolving work order:', error);
      Alert.alert('Error', error.message || 'Failed to resolve work order');
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
          <Text style={styles.title}>Resolve Work Order</Text>
        </View>

        {/* Action Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Action Taken *</Text>
          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionCard,
                  actionTaken === action.id && styles.actionCardActive,
                ]}
                onPress={() => setActionTaken(action.id)}
              >
                <Text style={styles.actionIcon}>{action.label.split(' ')[0]}</Text>
                <Text
                  style={[
                    styles.actionLabel,
                    actionTaken === action.id && styles.actionLabelActive,
                  ]}
                >
                  {action.label.split(' ').slice(1).join(' ')}
                </Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resolution Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Resolution Notes *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what was done to resolve the issue..."
            multiline
            numberOfLines={6}
            value={resolutionNotes}
            onChangeText={setResolutionNotes}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>Provide detailed information about the work performed</Text>
        </View>

        {/* New Device ID (if replaced) */}
        {actionTaken === 'replaced' && (
          <View style={styles.section}>
            <Text style={styles.label}>New Device ID *</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={styles.input}
                placeholder="Enter new device ID"
                value={newDeviceId}
                onChangeText={setNewDeviceId}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push('/technician/qr-scanner')}
              >
                <Text style={styles.scanButtonText}>📷 Scan</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Scan or enter the new device's ID</Text>
          </View>
        )}

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
              <Text style={styles.submitButtonText}>Submit Resolution</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Resolution Guidelines</Text>
          <Text style={styles.helpText}>
            • Select the appropriate action taken{'\n'}
            • Provide clear and detailed notes{'\n'}
            • If device was replaced, scan or enter the new device ID{'\n'}
            • Ensure all required information is accurate
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
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.medium,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: SPACING.small,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  actionLabelActive: {
    color: COLORS.primary,
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  input: {
    flex: 1,
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
  inputWithButton: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  scanButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.medium,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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

export default ResolveWorkOrderScreen;

