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
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  Home, 
  Recycle, 
  Leaf, 
  Smartphone, 
  AlertTriangle, 
  Map, 
  Keyboard, 
  Calendar, 
  ClipboardList 
} from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { MapPicker } from '../../components/Admin';
import { CitizenBottomNav } from '../../components/Citizen';
import { citizenApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { useUserDetails } from '../../contexts/UserDetailsContext';

const CreateRequestScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { userDetails } = useUserDetails();
  const [loading, setLoading] = useState(false);
  const [useMapPicker, setUseMapPicker] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState({
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
    { value: 'household', label: 'Household', icon: Home },
    { value: 'recyclable', label: 'Recyclable', icon: Recycle },
    { value: 'organic', label: 'Organic', icon: Leaf },
    { value: 'electronic', label: 'Electronic', icon: Smartphone },
    { value: 'hazardous', label: 'Hazardous', icon: AlertTriangle },
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

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      // Format date to YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      updateFormData('preferredDate', formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Select a date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const validateForm = () => {
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
        userId: userDetails?.id || user?.id, // Use user details from context or auth context
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
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
        <Text style={styles.title}>Create Waste Request</Text>
        <Text style={styles.subtitle}>Schedule your waste collection</Text>
      </View>

      <View style={styles.form}>
        {/* User ID - Temporary */}
        <View style={styles.tempNotice}>
          <Text style={styles.tempNoticeText}>
            <AlertTriangle size={16} color={COLORS.warningText} /> User ID will be automatically assigned from your logged-in account
          </Text>
        </View>

        {/* Waste Type Selection */}
        <Text style={styles.sectionTitle}>Waste Type *</Text>
        <View style={styles.wasteTypeContainer}>
          {wasteTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.wasteTypeCard,
                  formData.wasteType === type.value && styles.wasteTypeCardSelected,
                ]}
                onPress={() => updateFormData('wasteType', type.value)}
              >
                <IconComponent 
                  size={32} 
                  color={formData.wasteType === type.value ? COLORS.primary : COLORS.text} 
                />
                <Text
                  style={[
                    styles.wasteTypeText,
                    formData.wasteType === type.value && styles.wasteTypeTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
              <Map size={16} color={useMapPicker ? COLORS.white : COLORS.textLight} /> Use Map
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !useMapPicker && styles.toggleButtonActive]}
            onPress={() => setUseMapPicker(false)}
          >
            <Text style={[styles.toggleButtonText, !useMapPicker && styles.toggleButtonTextActive]}>
              <Keyboard size={16} color={!useMapPicker ? COLORS.white : COLORS.textLight} /> Manual Entry
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
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={showDatePickerModal}
        >
          <Calendar size={20} color={COLORS.text} />
          <Text style={[
            styles.datePickerText,
            !formData.preferredDate && styles.datePickerPlaceholder
          ]}>
            {formatDateDisplay(formData.preferredDate)}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            textColor={COLORS.text}
          />
        )}
        
        {Platform.OS === 'ios' && showDatePicker && (
          <View style={styles.iosDatePickerActions}>
            <TouchableOpacity 
              style={styles.iosDatePickerButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.iosDatePickerButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

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
            <Text style={styles.submitButtonText}>
              <ClipboardList size={16} color={COLORS.white} /> Submit Request
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <CitizenBottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePickerIcon: {
    fontSize: 20,
    marginRight: SPACING.small,
  },
  datePickerText: {
    fontSize: 15,
    color: COLORS.text,
  },
  datePickerPlaceholder: {
    color: COLORS.textLight,
  },
  iosDatePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.medium,
  },
  iosDatePickerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  iosDatePickerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
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
