import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

// Note: This is a placeholder component. In a real implementation, you would use:
// - expo-barcode-scanner
// - react-native-camera
// For now, we'll provide a manual input fallback

const QRScanner = ({ onScan, onCancel }) => {
  const [manualInput, setManualInput] = useState('');

  // In a real implementation, you would initialize the camera here
  useEffect(() => {
    // Request camera permissions
    // Initialize barcode scanner
    // Handle scan events
  }, []);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    } else {
      Alert.alert('Error', 'Please enter a code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera View Placeholder */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.placeholderText}>📷</Text>
        <Text style={styles.placeholderSubtext}>Camera Scanner</Text>
        <Text style={styles.infoText}>
          Position QR code within the frame
        </Text>
      </View>

      {/* Manual Input Fallback */}
      <View style={styles.manualInputSection}>
        <Text style={styles.manualInputLabel}>Or enter manually:</Text>
        <TextInput
          style={styles.manualInput}
          placeholder="Enter code manually"
          value={manualInput}
          onChangeText={setManualInput}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleManualSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to scan:</Text>
        <Text style={styles.instructionsText}>
          1. Hold device steady{'\n'}
          2. Point camera at QR code{'\n'}
          3. Wait for automatic detection{'\n'}
          4. Or enter code manually above
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.large,
    borderRadius: 16,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: SPACING.medium,
  },
  placeholderSubtext: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.small,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  manualInputSection: {
    padding: SPACING.large,
    backgroundColor: COLORS.white,
  },
  manualInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  manualInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  button: {
    flex: 1,
    padding: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    margin: SPACING.large,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
});

export default QRScanner;

