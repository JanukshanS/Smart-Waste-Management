import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { X, Cpu, MapPin } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING } from '../../constants/theme';
import { getDevices } from '../../api/adminApi';
import MapLocationPicker from './MapLocationPicker';

const CreateBinBottomSheet = ({ visible, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [devices, setDevices] = useState([]);
  const [formData, setFormData] = useState({
    binId: '',
    binType: 'general',
    capacity: '240',
    fillLevel: '0',
    status: 'active',
    address: '',
    area: '',
    lat: '',
    lng: '',
    deviceId: '',
  });

  const binTypes = [
    { label: 'General', value: 'general' },
    { label: 'Recyclable', value: 'recyclable' },
    { label: 'Organic', value: 'organic' },
    { label: 'Hazardous', value: 'hazardous' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  // Fetch devices when modal opens
  useEffect(() => {
    if (visible) {
      fetchDevices();
    }
  }, [visible]);

  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const response = await getDevices({ page: 1, limit: 100 });
      
      if (response.success && response.message) {
        // Filter only available devices (not already bound to a bin or in maintenance)
        const availableDevices = response.message.filter(
          device => device.status === 'active' && (!device.binId || device.binId === null)
        );
        setDevices(availableDevices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      Alert.alert('Error', 'Failed to load devices. Please try again.');
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.binId.trim()) {
      Alert.alert('Validation Error', 'Bin ID is required');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Address is required');
      return false;
    }
    if (!formData.area.trim()) {
      Alert.alert('Validation Error', 'Area is required');
      return false;
    }
    if (!formData.lat || !formData.lng) {
      Alert.alert('Validation Error', 'Coordinates (Latitude and Longitude) are required');
      return false;
    }
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Validation Error', 'Please enter valid coordinates');
      return false;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Validation Error', 'Please enter valid coordinate ranges');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const binData = {
      binId: formData.binId.trim(),
      binType: formData.binType,
      capacity: parseInt(formData.capacity) || 240,
      fillLevel: parseInt(formData.fillLevel) || 0,
      status: formData.status,
      location: {
        address: formData.address.trim(),
        area: formData.area.trim(),
        coordinates: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
      },
    };

    // Add deviceId if selected
    if (formData.deviceId) {
      binData.deviceId = formData.deviceId;
    }

    try {
      setLoading(true);
      await onSuccess(binData);
      // Reset form
      setFormData({
        binId: '',
        binType: 'general',
        capacity: '240',
        fillLevel: '0',
        status: 'active',
        address: '',
        area: '',
        lat: '',
        lng: '',
        deviceId: '',
      });
      onClose();
    } catch (error) {
      // Error already handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New Bin</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Bin ID */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bin ID *</Text>
              <TextInput
                style={styles.input}
                value={formData.binId}
                onChangeText={(val) => handleInputChange('binId', val)}
                placeholder="e.g., BIN-005"
                placeholderTextColor={COLORS.textLight}
                editable={!loading}
              />
            </View>

            {/* Bin Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bin Type *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.binType}
                  onValueChange={(val) => handleInputChange('binType', val)}
                  enabled={!loading}
                >
                  {binTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Capacity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Capacity (Liters) *</Text>
              <TextInput
                style={styles.input}
                value={formData.capacity}
                onChangeText={(val) => handleInputChange('capacity', val)}
                placeholder="240"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
                editable={!loading}
              />
            </View>

            {/* Fill Level */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Initial Fill Level (%) *</Text>
              <TextInput
                style={styles.input}
                value={formData.fillLevel}
                onChangeText={(val) => handleInputChange('fillLevel', val)}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={COLORS.textLight}
                editable={!loading}
              />
            </View>

            {/* Status */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(val) => handleInputChange('status', val)}
                  enabled={!loading}
                >
                  {statusOptions.map((status) => (
                    <Picker.Item key={status.value} label={status.label} value={status.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Device Selection */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Cpu size={16} color={COLORS.primary} />
                <Text style={styles.label}>Assign Device (Optional)</Text>
              </View>
              {loadingDevices ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading devices...</Text>
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.deviceId}
                    onValueChange={(val) => handleInputChange('deviceId', val)}
                    enabled={!loading && devices.length > 0}
                  >
                    <Picker.Item label="No Device (Manual Entry)" value="" />
                    {devices.map((device) => (
                      <Picker.Item 
                        key={device._id} 
                        label={`${device.deviceId} - ${device.deviceType}`}
                        value={device._id} 
                      />
                    ))}
                  </Picker>
                </View>
              )}
              {!loadingDevices && devices.length === 0 && (
                <Text style={styles.helperText}>
                  No available devices found. All devices are already assigned or in maintenance.
                </Text>
              )}
              {formData.deviceId && (
                <Text style={styles.helperText}>
                  Device {devices.find(d => d._id === formData.deviceId)?.deviceId || formData.deviceId} will be bound to this bin.
                </Text>
              )}
            </View>

            {/* Location Section with Map */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Location Details</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Select the bin location on the map. Address and coordinates will be auto-filled.
              </Text>
              
              <MapLocationPicker
                initialLocation={{
                  lat: formData.lat ? parseFloat(formData.lat) : 6.9271,
                  lng: formData.lng ? parseFloat(formData.lng) : 79.8612,
                  address: formData.address,
                  area: formData.area,
                }}
                onLocationSelect={(location) => {
                  handleInputChange('lat', location.lat.toString());
                  handleInputChange('lng', location.lng.toString());
                }}
                onAddressChange={(address) => handleInputChange('address', address)}
                onAreaChange={(area) => handleInputChange('area', area)}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.createButtonText}>Create Bin</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
    paddingBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
  },
  formGroup: {
    marginBottom: SPACING.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  coordRow: {
    flexDirection: 'row',
    gap: SPACING.medium,
  },
  coordInput: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    marginBottom: SPACING.small,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.small,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.small,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.small,
    marginBottom: SPACING.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: SPACING.medium,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.medium,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.medium,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CreateBinBottomSheet;

