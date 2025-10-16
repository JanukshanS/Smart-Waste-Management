import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import MapPicker from './MapPicker';

const { height } = Dimensions.get('window');

const CreateUserBottomSheet = ({ visible, onClose, onSuccess }) => {
  const [slideAnim] = useState(new Animated.Value(height));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [useMapPicker, setUseMapPicker] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'citizen',
    status: 'active',
    address: {
      street: '',
      city: '',
      postalCode: '',
      coordinates: {
        lat: '',
        lng: '',
      },
    },
  });

  const roles = ['citizen', 'coordinator', 'technician', 'admin'];
  const statuses = ['active', 'inactive', 'suspended'];

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetForm();
      onClose();
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'citizen',
      status: 'active',
      address: {
        street: '',
        city: '',
        postalCode: '',
        coordinates: {
          lat: '',
          lng: '',
        },
      },
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter name');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter email');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter phone');
      return;
    }
    if (!formData.address.street.trim()) {
      alert('Please enter street address');
      return;
    }
    if (!formData.address.city.trim()) {
      alert('Please enter city');
      return;
    }
    if (!formData.address.postalCode.trim()) {
      alert('Please enter postal code');
      return;
    }
    if (!formData.address.coordinates.lat) {
      alert('Please enter latitude');
      return;
    }
    if (!formData.address.coordinates.lng) {
      alert('Please enter longitude');
      return;
    }

    setLoading(true);
    
    // Convert coordinates to numbers
    const userData = {
      ...formData,
      address: {
        ...formData.address,
        coordinates: {
          lat: parseFloat(formData.address.coordinates.lat),
          lng: parseFloat(formData.address.coordinates.lng),
        },
      },
    };

    try {
      await onSuccess(userData);
      handleClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updateCoordinates = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        coordinates: { ...prev.address.coordinates, [field]: value },
      },
    }));
  };

  const handleMapLocationSelect = (location) => {
    setFormData(prev => ({
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New User</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="John Doe"
              placeholderTextColor={COLORS.textLight}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="john.doe@example.com"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              placeholder="+94771234567"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />

            {/* Role & Status */}
            <Text style={styles.label}>Role *</Text>
            <View style={styles.chipContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.chip,
                    formData.role === role && styles.chipSelected,
                  ]}
                  onPress={() => updateFormData('role', role)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.role === role && styles.chipTextSelected,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Status *</Text>
            <View style={styles.chipContainer}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.chip,
                    formData.status === status && styles.chipSelected,
                  ]}
                  onPress={() => updateFormData('status', status)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.status === status && styles.chipTextSelected,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Address */}
            <Text style={styles.sectionTitle}>Address</Text>

            <Text style={styles.label}>Street *</Text>
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

            <Text style={styles.label}>Postal Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.address.postalCode}
              onChangeText={(value) => updateAddress('postalCode', value)}
              placeholder="10100"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
            />

            {/* Coordinates */}
            <Text style={styles.sectionTitle}>Location Coordinates</Text>

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

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Create User</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.small,
    marginBottom: SPACING.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.textLight,
    fontWeight: '300',
  },
  form: {
    flex: 1,
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
  },
  sectionTitle: {
    fontSize: 16,
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
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.medium,
    gap: SPACING.small,
  },
  chip: {
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.medium,
    marginTop: SPACING.large,
    marginBottom: SPACING.large * 2,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    padding: 4,
    gap: 4,
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
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  toggleButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CreateUserBottomSheet;

