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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { MapPicker } from '../../components/Admin';
import { citizenApi } from '../../api';

const CreateRequestScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [useMapPicker, setUseMapPicker] = useState(true);

  const [formData, setFormData] = useState({
    userId: '',
    wasteType: 'household',
    quantity: '',
    address: {
      street: '',
      city: '',
      coordinates: {
        lat: '',
        lng: '',
      },
    },
    preferredDate: '',
    description: '',
  });

  const wasteTypes = [
    { value: 'household', label: 'Household', icon: '🏠' },
    { value: 'recyclable', label: 'Recyclable', icon: '♻️' },
    { value: 'organic', label: 'Organic', icon: '🌱' },
    { value: 'electronic', label: 'Electronic', icon: '📱' },
    { value: 'hazardous', label: 'Hazardous', icon: '⚠️' },
  ];

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updateCoordinates = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates: { ...prev.address.coordinates, [field]: value },
      },
    }));
  };

  const handleMapLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates: {
          lat: location.latitude.toString(),
          lng: location.longitude.toString(),
        },
      },
    }));
  };

  const validateForm = () => {
    if (!formData.userId.trim()) {
      Alert.alert('Validation Error', 'Please enter User ID');
      return false;
    }
    if (!formData.quantity.trim()) {
      Alert.alert('Validation Error', 'Please enter quantity');
      return false;
    }
    if (!formData.address.street.trim()) {
      Alert.alert('Validation Error', 'Please enter street address');
      return false;
    }
    if (!formData.address.city.trim()) {
      Alert.alert('Validation Error', 'Please enter city');
      return false;
    }
    if (!formData.address.coordinates.lat || !formData.address.coordinates.lng) {
      Alert.alert('Validation Error', 'Please select location coordinates');
      return false;
    }
    if (!formData.preferredDate.trim()) {
      Alert.alert('Validation Error', 'Please enter preferred date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare request data
      const requestData = {
        ...formData,
        address: {
          ...formData.address,
          coordinates: {
            lat: parseFloat(formData.address.coordinates.lat),
            lng: parseFloat(formData.address.coordinates.lng),
          },
        },
      };

      const response = await citizenApi.createRequest(requestData);

      if (response.success) {
        Alert.alert(
          'Success! 🎉',
          'Your waste collection request has been created successfully!',
          [
            {
              text: 'View My Requests',
              onPress: () => router.push('/citizen/my-requests'),
            },
            {
              text: 'Create Another',
              onPress: () => resetForm(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create request');
      }
    } catch (error) {
      console.error('Create request error:', error);
      Alert.alert('Error', 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: formData.userId, // Keep userId
      wasteType: 'household',
      quantity: '',
      address: {
        street: '',
        city: '',
        coordinates: {
          lat: '',
          lng: '',
        },
      },
      preferredDate: '',
      description: '',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Waste Request</Text>
        <Text style={styles.subtitle}>Schedule your waste collection</Text>
      </View>

      <View style={styles.form}>
        {/* User ID - Temporary */}
        <View style={styles.tempNotice}>
          <Text style={styles.tempNoticeText}>
            ⚠️ Temporary: Enter User ID manually (will be automatic later)
          </Text>
        </View>

        <Text style={styles.label}>User ID *</Text>
        <TextInput
          style={styles.input}
          value={formData.userId}
          onChangeText={(value) => updateFormData('userId', value)}
          placeholder="Enter your user ID"
          placeholderTextColor={COLORS.textLight}
        />

        {/* Waste Type Selection */}
        <Text style={styles.sectionTitle}>Waste Type *</Text>
        <View style={styles.wasteTypeContainer}>
          {wasteTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.wasteTypeCard,
                formData.wasteType === type.value && styles.wasteTypeCardSelected,
              ]}
              onPress={() => updateFormData('wasteType', type.value)}
            >
              <Text style={styles.wasteTypeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.wasteTypeText,
                  formData.wasteType === type.value && styles.wasteTypeTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity */}
        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={styles.input}
          value={formData.quantity}
          onChangeText={(value) => updateFormData('quantity', value)}
          placeholder="e.g., 3 bags, 1 item, Small/Medium/Large"
          placeholderTextColor={COLORS.textLight}
        />

        {/* Address */}
        <Text style={styles.sectionTitle}>Pickup Address *</Text>

        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.address.street}
          onChangeText={(value) => updateAddress('street', value)}
          placeholder="123 Main Street"
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={formData.address.city}
          onChangeText={(value) => updateAddress('city', value)}
          placeholder="Colombo"
          placeholderTextColor={COLORS.textLight}
        />

        {/* Location Coordinates */}
        <Text style={styles.sectionTitle}>Pickup Location *</Text>

        {/* Toggle between Map and Manual Entry */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, useMapPicker && styles.toggleButtonActive]}
            onPress={() => setUseMapPicker(true)}
          >
            <Text style={[styles.toggleButtonText, useMapPicker && styles.toggleButtonTextActive]}>
              🗺️ Use Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !useMapPicker && styles.toggleButtonActive]}
            onPress={() => setUseMapPicker(false)}
          >
            <Text style={[styles.toggleButtonText, !useMapPicker && styles.toggleButtonTextActive]}>
              ⌨️ Manual Entry
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map Picker */}
        {useMapPicker ? (
          <MapPicker
            initialLocation={
              formData.address.coordinates.lat && formData.address.coordinates.lng
                ? {
                    latitude: parseFloat(formData.address.coordinates.lat),
                    longitude: parseFloat(formData.address.coordinates.lng),
                  }
                : undefined
            }
            onLocationSelect={handleMapLocationSelect}
          />
        ) : (
          /* Manual Entry */
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Latitude *</Text>
              <TextInput
                style={styles.input}
                value={formData.address.coordinates.lat}
                onChangeText={(value) => updateCoordinates('lat', value)}
                placeholder="6.9271"
                placeholderTextColor={COLORS.textLight}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Longitude *</Text>
              <TextInput
                style={styles.input}
                value={formData.address.coordinates.lng}
                onChangeText={(value) => updateCoordinates('lng', value)}
                placeholder="79.8612"
                placeholderTextColor={COLORS.textLight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        )}

        {/* Preferred Date */}
        <Text style={styles.label}>Preferred Collection Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.preferredDate}
          onChangeText={(value) => updateFormData('preferredDate', value)}
          placeholder="YYYY-MM-DD (e.g., 2025-10-19)"
          placeholderTextColor={COLORS.textLight}
        />
        <Text style={styles.helpText}>Format: YYYY-MM-DD (e.g., 2025-10-19)</Text>

        {/* Description */}
        <Text style={styles.label}>Additional Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          placeholder="Any additional information or special instructions..."
          placeholderTextColor={COLORS.textLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>📋 Submit Request</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.large,
    paddingTop: SPACING.large + 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  form: {
    padding: SPACING.large,
  },
  tempNotice: {
    backgroundColor: COLORS.warningBg,
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.large,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tempNoticeText: {
    fontSize: 13,
    color: COLORS.warningText,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.large,
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small / 2,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.medium,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: -SPACING.small,
    marginBottom: SPACING.medium,
    fontStyle: 'italic',
  },
  wasteTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  wasteTypeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.small,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  wasteTypeCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  wasteTypeIcon: {
    fontSize: 32,
    marginBottom: SPACING.small / 2,
  },
  wasteTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  wasteTypeTextSelected: {
    color: COLORS.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium + 2,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cancelButton: {
    paddingVertical: SPACING.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default CreateRequestScreen;
