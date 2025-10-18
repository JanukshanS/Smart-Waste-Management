import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  MapPin,
  Package,
  AlertCircle,
  Edit,
  Recycle,
  Leaf,
  AlertTriangle,
  Cpu,
  Battery,
  Signal,
  MapPinned,
} from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SPACING } from '../../constants/theme';
import { adminApi } from '../../api';

const BinDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const binId = params.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bin, setBin] = useState(null);

  useEffect(() => {
    if (binId) {
      fetchBinDetails();
    } else {
      console.error('No bin ID provided');
      Alert.alert('Error', 'No bin ID provided');
      router.back();
    }
  }, [binId]);

  const fetchBinDetails = async () => {
    if (!binId) {
      console.error('No bin ID provided to fetchBinDetails');
      setLoading(false);
      return;
    }

    try {
      setLoading(!refreshing);

      console.log('🔍 Fetching bin details for ID:', binId);
      const response = await adminApi.getBinById(binId);
      console.log('🟢 Full API Response:', JSON.stringify(response, null, 2));

      // ✅ Extract bin data from various possible response structures
      let binData = null;
      
      if (response?.message && typeof response.message === 'object' && response.message._id) {
        // Backend format: { success: true, message: {...bin data...}, data: "message" }
        binData = response.message;
      } else if (response?.data && typeof response.data === 'object' && response.data._id) {
        // Alternative format: { success: true, data: {...bin data...} }
        binData = response.data;
      } else if (response?._id) {
        // Direct bin object
        binData = response;
      }

      console.log('✅ Extracted bin data:', binData ? 'Success' : 'Failed');
      console.log('📦 Bin ID:', binData?.binId, '| Status:', binData?.status, '| Fill:', binData?.fillLevel);

      if (!binData || !binData._id) {
        console.error('❌ Invalid bin data structure');
        Alert.alert('Error', 'Invalid response format from server');
        setBin(null);
      } else {
        setBin(binData);
      }
    } catch (error) {
      console.error('❌ Fetch bin details error:', error);
      Alert.alert('Error', `Failed to load bin details: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBinDetails();
  };

  const handleEdit = () => {
    Alert.alert('Coming Soon', 'Edit bin functionality will be available soon.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bin',
      `Are you sure you want to delete bin ${bin?.binId}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminApi.deleteBin(bin._id);
              if (response.success) {
                Alert.alert('Success', 'Bin deleted successfully');
                router.back();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete bin');
              }
            } catch (error) {
              console.error('Delete bin error:', error);
              Alert.alert('Error', 'Failed to delete bin. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getBinTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'recyclable':
        return <Recycle size={20} color={COLORS.success} />;
      case 'organic':
        return <Leaf size={20} color={COLORS.success} />;
      case 'hazardous':
        return <AlertTriangle size={20} color={COLORS.warning} />;
      default:
        return <Trash2 size={20} color={COLORS.primary} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return COLORS.success;
      case 'full':
        return COLORS.error;
      case 'maintenance':
        return COLORS.warning;
      case 'inactive':
        return COLORS.textLight;
      default:
        return COLORS.textLight;
    }
  };

  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 80) return COLORS.error;
    if (fillLevel >= 60) return COLORS.warning;
    if (fillLevel >= 20) return COLORS.primary;
    return COLORS.success;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !bin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bin details...</Text>
      </View>
    );
  }

  if (!bin) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color={COLORS.error} />
        <Text style={styles.errorText}>Bin not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{bin.binId || 'Bin Details'}</Text>
          <Text style={styles.headerSubtitle}>Bin Information</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
            <Edit size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Fill Level Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Package size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Fill Level</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bin.status) }]}>
              <Text style={styles.statusBadgeText}>{bin.status || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.fillLevelContainer}>
            <Text style={[styles.fillLevelText, { color: getFillLevelColor(bin.fillLevel || 0) }]}>
              {bin.fillLevel ?? 0}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${bin.fillLevel ?? 0}%`,
                    backgroundColor: getFillLevelColor(bin.fillLevel || 0),
                  },
                ]}
              />
            </View>
            <Text style={styles.capacityText}>
              Capacity: {bin.capacity ? `${bin.capacity}L` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Bin Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Trash2 size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Bin Information</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <View style={styles.infoValueRow}>
              {getBinTypeIcon(bin.binType)}
              <Text style={styles.infoValue}>
                {bin.binType
                  ? bin.binType.charAt(0).toUpperCase() + bin.binType.slice(1)
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Collections</Text>
            <Text style={styles.infoValue}>{bin.collectionCount || 0} times</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Emptied</Text>
            <Text style={styles.infoValue}>{formatDate(bin.lastEmptied)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>{formatDateTime(bin.updatedAt)}</Text>
          </View>
        </View>

        {/* Location */}
        {bin.location && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Location</Text>
              </View>
            </View>

            {bin.location.coordinates?.lat && bin.location.coordinates?.lng && (
              <View style={styles.mapContainer}>
                <MapView
                  provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                  style={styles.map}
                  initialRegion={{
                    latitude: bin.location.coordinates.lat,
                    longitude: bin.location.coordinates.lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: bin.location.coordinates.lat,
                      longitude: bin.location.coordinates.lng,
                    }}
                  >
                    <MapPin size={32} color={COLORS.error} fill={COLORS.error} />
                  </Marker>
                </MapView>
              </View>
            )}

            <View style={styles.locationInfo}>
              <View style={styles.infoRow}>
                <MapPinned size={16} color={COLORS.textLight} />
                <Text style={styles.addressText}>{bin.location?.address || 'N/A'}</Text>
              </View>
              <Text style={styles.areaText}>{bin.location?.area || 'N/A'}</Text>
              {bin.location?.coordinates?.lat && bin.location?.coordinates?.lng && (
                <Text style={styles.coordsText}>
                  {bin.location.coordinates.lat.toFixed(6)}, {bin.location.coordinates.lng.toFixed(6)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={20} color={COLORS.white} />
          <Text style={styles.deleteButtonText}>Delete Bin</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

// === Styles remain unchanged ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: COLORS.textLight },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 10, fontSize: 18, fontWeight: '600', color: COLORS.error },
  backButton: { marginTop: 20, padding: 10, backgroundColor: COLORS.primary, borderRadius: 12 },
  backButtonText: { color: COLORS.white, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerActions: { flexDirection: 'row' },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, color: COLORS.white, textTransform: 'capitalize' },
  fillLevelContainer: { alignItems: 'center', marginTop: 8 },
  fillLevelText: { fontSize: 48, fontWeight: 'bold' },
  progressBarContainer: { width: '100%', height: 12, borderRadius: 6, backgroundColor: COLORS.background },
  progressBar: { height: '100%', borderRadius: 6 },
  capacityText: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { fontSize: 14, color: COLORS.textLight },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  mapContainer: { height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  map: { flex: 1 },
  locationInfo: { gap: 4 },
  addressText: { flex: 1, fontWeight: '600', fontSize: 15, color: COLORS.text, marginLeft: 4 },
  areaText: { fontSize: 14, color: COLORS.textLight },
  coordsText: { fontSize: 12, color: COLORS.textLight, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  deleteButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 16 },
  bottomPadding: { height: 50 },
});

export default BinDetailsScreen;
