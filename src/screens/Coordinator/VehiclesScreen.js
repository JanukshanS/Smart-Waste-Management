import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput as RNTextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Chip, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import { VehicleCard } from '../../components/Coordinator';
import { coordinatorApi } from '../../api';

const VehiclesScreen = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Vehicle Dialog
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleId: '',
    licensePlate: '',
    vehicleType: 'truck',
    capacity: '',
    manufacturer: '',
    model: '',
    year: '',
    fuelType: 'diesel',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vehicles, selectedStatus, selectedType, searchQuery]);

  const fetchVehicles = async () => {
    try {
      const response = await coordinatorApi.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
        setError(null);
      } else {
        console.error('Invalid response structure:', response);
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((v) => v.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((v) => v.vehicleType === selectedType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.vehicleId?.toLowerCase().includes(query) ||
          v.licensePlate?.toLowerCase().includes(query) ||
          v.manufacturer?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query)
      );
    }

    setFilteredVehicles(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const handleCreateVehicle = async () => {
    // Validate required fields
    if (
      !newVehicle.vehicleId.trim() ||
      !newVehicle.licensePlate.trim() ||
      !newVehicle.capacity.trim()
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setCreateLoading(true);
      const vehicleData = {
        ...newVehicle,
        capacity: parseFloat(newVehicle.capacity),
        year: newVehicle.year ? parseInt(newVehicle.year) : null,
      };

      const response = await coordinatorApi.createVehicle(vehicleData);

      if (response.success) {
        Alert.alert('Success', 'Vehicle created successfully');
        setCreateDialogVisible(false);
        resetCreateForm();
        fetchVehicles();
      }
    } catch (err) {
      console.error('Error creating vehicle:', err);
      Alert.alert('Error', err.message || 'Failed to create vehicle');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setNewVehicle({
      vehicleId: '',
      licensePlate: '',
      vehicleType: 'truck',
      capacity: '',
      manufacturer: '',
      model: '',
      year: '',
      fuelType: 'diesel',
    });
  };

  const handleVehiclePress = (vehicle) => {
    // Navigate to vehicle details screen (to be created if needed)
    // For now, show an alert
    Alert.alert(
      vehicle.vehicleId,
      `Status: ${vehicle.status}\nType: ${vehicle.vehicleType}\nCapacity: ${vehicle.capacity}m³`,
      [{ text: 'OK' }]
    );
  };

  const getStatusCounts = () => {
    const counts = {
      all: vehicles.length,
      available: vehicles.filter((v) => v.status === 'available').length,
      'in-use': vehicles.filter((v) => v.status === 'in-use').length,
      maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statusCounts.all}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>
            {statusCounts.available}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>
            {statusCounts['in-use']}
          </Text>
          <Text style={styles.statLabel}>In Use</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FFA500' }]}>
            {statusCounts.maintenance}
          </Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </View>
      </View>

      {/* Search Bar */}
      <RNTextInput
        style={styles.searchBar}
        placeholder="Search vehicles..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={COLORS.textLight}
      />

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Status:</Text>
        <View style={styles.chipContainer}>
          <Chip
            selected={selectedStatus === 'all'}
            onPress={() => setSelectedStatus('all')}
            style={styles.chip}
          >
            All
          </Chip>
          <Chip
            selected={selectedStatus === 'available'}
            onPress={() => setSelectedStatus('available')}
            style={styles.chip}
          >
            Available
          </Chip>
          <Chip
            selected={selectedStatus === 'in-use'}
            onPress={() => setSelectedStatus('in-use')}
            style={styles.chip}
          >
            In Use
          </Chip>
          <Chip
            selected={selectedStatus === 'maintenance'}
            onPress={() => setSelectedStatus('maintenance')}
            style={styles.chip}
          >
            Maintenance
          </Chip>
        </View>
      </View>

      {/* Vehicle List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchVehicles} />
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <VehicleCard vehicle={item} onPress={() => handleVehiclePress(item)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No vehicles found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedStatus !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first vehicle to get started'}
              </Text>
            </View>
          }
        />
      )}

      {/* Create Vehicle Button */}
      <View style={styles.fabContainer}>
        <Button
          title="+ Add Vehicle"
          onPress={() => setCreateDialogVisible(true)}
          style={styles.fab}
        />
      </View>

      {/* Create Vehicle Modal */}
      <Modal
        visible={createDialogVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateDialogVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Vehicle</Text>
              <TouchableOpacity
                onPress={() => {
                  setCreateDialogVisible(false);
                  resetCreateForm();
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formContent}>
              <TextInput
                mode="outlined"
                label="Vehicle ID *"
                placeholder="e.g., VEH-001"
                value={newVehicle.vehicleId}
                onChangeText={(text) =>
                  setNewVehicle({ ...newVehicle, vehicleId: text.toUpperCase() })
                }
                style={styles.input}
                disabled={createLoading}
              />

              <TextInput
                mode="outlined"
                label="License Plate *"
                placeholder="e.g., ABC-1234"
                value={newVehicle.licensePlate}
                onChangeText={(text) =>
                  setNewVehicle({ ...newVehicle, licensePlate: text.toUpperCase() })
                }
                style={styles.input}
                disabled={createLoading}
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Vehicle Type *</Text>
                <Picker
                  selectedValue={newVehicle.vehicleType}
                  onValueChange={(value) =>
                    setNewVehicle({ ...newVehicle, vehicleType: value })
                  }
                  style={styles.picker}
                  enabled={!createLoading}
                >
                  <Picker.Item label="Truck" value="truck" />
                  <Picker.Item label="Van" value="van" />
                  <Picker.Item label="Compactor" value="compactor" />
                  <Picker.Item label="Pickup" value="pickup" />
                </Picker>
              </View>

              <TextInput
                mode="outlined"
                label="Capacity (m³) *"
                placeholder="e.g., 10"
                value={newVehicle.capacity}
                onChangeText={(text) =>
                  setNewVehicle({ ...newVehicle, capacity: text })
                }
                keyboardType="numeric"
                style={styles.input}
                disabled={createLoading}
              />

              <TextInput
                mode="outlined"
                label="Manufacturer"
                placeholder="e.g., Volvo"
                value={newVehicle.manufacturer}
                onChangeText={(text) =>
                  setNewVehicle({ ...newVehicle, manufacturer: text })
                }
                style={styles.input}
                disabled={createLoading}
              />

              <TextInput
                mode="outlined"
                label="Model"
                placeholder="e.g., FH16"
                value={newVehicle.model}
                onChangeText={(text) =>
                  setNewVehicle({ ...newVehicle, model: text })
                }
                style={styles.input}
                disabled={createLoading}
              />

              <TextInput
                mode="outlined"
                label="Year"
                placeholder="e.g., 2023"
                value={newVehicle.year}
                onChangeText={(text) => setNewVehicle({ ...newVehicle, year: text })}
                keyboardType="numeric"
                style={styles.input}
                disabled={createLoading}
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Fuel Type</Text>
                <Picker
                  selectedValue={newVehicle.fuelType}
                  onValueChange={(value) =>
                    setNewVehicle({ ...newVehicle, fuelType: value })
                  }
                  style={styles.picker}
                  enabled={!createLoading}
                >
                  <Picker.Item label="Diesel" value="diesel" />
                  <Picker.Item label="Petrol" value="petrol" />
                  <Picker.Item label="Electric" value="electric" />
                  <Picker.Item label="Hybrid" value="hybrid" />
                </Picker>
              </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setCreateDialogVisible(false);
                  resetCreateForm();
                }}
                disabled={createLoading}
                style={styles.cancelButton}
              />
              <Button
                title={createLoading ? 'Creating...' : 'Create'}
                onPress={handleCreateVehicle}
                disabled={createLoading}
                style={styles.createButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchBar: {
    margin: SPACING.medium,
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.text,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.small,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.small,
  },
  chip: {
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  list: {
    padding: SPACING.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.large,
    right: SPACING.large,
    elevation: 8,
  },
  fab: {
    minWidth: 140,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: SPACING.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
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
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: '70%',
  },
  formContent: {
    padding: SPACING.large,
  },
  input: {
    marginBottom: SPACING.medium,
  },
  pickerContainer: {
    marginBottom: SPACING.medium,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  picker: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
    gap: SPACING.medium,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  createButton: {
    flex: 1,
  },
});

export default VehiclesScreen;

