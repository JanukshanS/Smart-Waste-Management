import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import * as technicianApi from '../../api/technicianApi';
import Button from '../../components/Button';

const DevicesScreen = () => {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loadingDevice, setLoadingDevice] = useState(false);

  useEffect(() => {
    fetchBins();
  }, [currentPage]);

  const fetchBins = async () => {
    try {
      setLoading(true);
      const response = await technicianApi.getBins({
        page: currentPage,
        limit: 20,
      });

      if (response.success) {
        // Handle different response structures
        let binsData = [];
        
        if (Array.isArray(response.data)) {
          binsData = response.data;
        } else if (Array.isArray(response.message)) {
          binsData = response.message;
        } else if (response.message && typeof response.message === 'object') {
          // Single bin object in message
          binsData = [response.message];
        } else if (response.data && typeof response.data === 'object') {
          // Single bin object in data
          binsData = [response.data];
        }

        setBins(binsData);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setHasNextPage(response.pagination.hasNextPage);
        }
      }
    } catch (error) {
      console.error('Fetch bins error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchBins();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleViewDevice = async (bin) => {
    try {
      setLoadingDevice(true);
      setShowDeviceModal(true);
      
      // Fetch devices using the bin ID
      const response = await technicianApi.getDevices({ binId: bin._id || bin.id });

      if (response.success) {
        // Handle different response structures
        let deviceData = null;
        
        if (Array.isArray(response.data)) {
          // If array, get the first device or find matching one
          deviceData = response.data.length > 0 ? response.data[0] : null;
        } else if (Array.isArray(response.message)) {
          // If array in message, get the first device
          deviceData = response.message.length > 0 ? response.message[0] : null;
        } else if (response.data && typeof response.data === 'object') {
          // Single device object in data
          deviceData = response.data;
        } else if (response.message && typeof response.message === 'object' && response.message._id) {
          // Single device object in message (check for _id to avoid string)
          deviceData = response.message;
        }

        if (deviceData) {
          setSelectedDevice(deviceData);
        } else {
          // No device found
          setShowDeviceModal(false);
          Alert.alert('No Device', 'This bin does not have any device attached.');
        }
      } else {
        setShowDeviceModal(false);
        Alert.alert('No Device', 'No device found for this bin.');
      }
    } catch (error) {
      console.error('Fetch device error:', error);
      Alert.alert('Error', 'Failed to load device details. Please try again.');
      setShowDeviceModal(false);
    } finally {
      setLoadingDevice(false);
    }
  };

  const renderBinCard = ({ item: bin }) => {
    const fillColor = bin.fillStatusColor || 'gray';
    const fillLabel = bin.fillStatusLabel || 'Unknown';
    const needsCollection = bin.needsCollection || false;

    return (
      <View style={styles.binCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.binIcon}></Text>
            <View>
              <Text style={styles.binId}>{bin.binId}</Text>
              <Text style={styles.binArea}>{bin.location?.area || 'No area'}</Text>
            </View>
          </View>
          <View style={[styles.fillStatusBadge, { backgroundColor: `${fillColor}20`, borderColor: fillColor }]}>
            <View style={[styles.fillDot, { backgroundColor: fillColor }]} />
            <Text style={[styles.fillStatusText, { color: fillColor }]}>{fillLabel}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{bin.location?.address || 'No address'}</Text>
          </View>

          {bin.location?.coordinates && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coordinates:</Text>
              <Text style={styles.detailValue}>
                {bin.location.coordinates.lat}, {bin.location.coordinates.lng}
              </Text>
            </View>
          )}

          {bin.deviceId && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Device:</Text>
              <Text style={styles.detailValue}>{bin.deviceId.deviceId || 'N/A'}</Text>
            </View>
          )}

          {needsCollection && (
            <View style={styles.collectionAlert}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.alertText}>Needs Collection</Text>
            </View>
          )}

          {bin.isUrgent && (
            <View style={styles.urgentAlert}>
              <Text style={styles.alertIcon}></Text>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.viewDeviceButton}
            onPress={() => handleViewDevice(bin)}
          >
            <Text style={styles.viewDeviceButtonText}>
              View Bin Mantainance History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerDeviceButton}
            onPress={() => Alert.alert('Coming Soon', 'Device registration functionality will be implemented')}
          >
            <Text style={styles.registerDeviceButtonText}>
              + Register Device
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.roleTechnician} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}></Text>
      <Text style={styles.emptyText}>No bins found</Text>
    </View>
  );

  if (loading && bins.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.roleTechnician} />
        <Text style={styles.loadingText}>Loading bins...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Bins</Text>
        <Text style={styles.subtitle}>
          Total: {bins.length} {bins.length === 1 ? 'bin' : 'bins'}
        </Text>
      </View>

      <FlatList
        data={bins}
        renderItem={renderBinCard}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.roleTechnician]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
            onPress={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNextPage}
          >
            <Text style={[styles.paginationButtonText, !hasNextPage && styles.paginationButtonTextDisabled]}>
              Next →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Device Details Modal */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeviceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Device Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDeviceModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingDevice ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.roleTechnician} />
                <Text style={styles.modalLoadingText}>Loading device details...</Text>
              </View>
            ) : selectedDevice ? (
              <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
                <View style={styles.deviceInfoSection}>
                  <Text style={styles.deviceIcon}></Text>
                  <Text style={styles.deviceIdText}>{selectedDevice.deviceId || 'N/A'}</Text>
                </View>

                <View style={styles.deviceDetailRow}>
                  <Text style={styles.deviceLabel}>Device Type:</Text>
                  <Text style={styles.deviceValue}>
                    {selectedDevice.deviceType?.toUpperCase() || 'N/A'}
                  </Text>
                </View>

                <View style={styles.deviceDetailRow}>
                  <Text style={styles.deviceLabel}>Status:</Text>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: selectedDevice.status === 'active' ? COLORS.success : COLORS.danger }
                    ]} />
                    <Text style={styles.deviceValue}>
                      {selectedDevice.status || 'Unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.deviceDetailRow}>
                  <Text style={styles.deviceLabel}>Online Status:</Text>
                  <Text style={styles.deviceValue}>
                    {selectedDevice.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>

                <View style={styles.deviceDetailRow}>
                  <Text style={styles.deviceLabel}>Battery Status:</Text>
                  <Text style={styles.deviceValue}>
                    {selectedDevice.batteryStatus || 'Unknown'}
                  </Text>
                </View>

                {selectedDevice.daysSinceLastSignal !== null && selectedDevice.daysSinceLastSignal !== undefined && (
                  <View style={styles.deviceDetailRow}>
                    <Text style={styles.deviceLabel}>Last Signal:</Text>
                    <Text style={styles.deviceValue}>
                      {selectedDevice.daysSinceLastSignal === 0 
                        ? 'Today' 
                        : `${selectedDevice.daysSinceLastSignal} days ago`}
                    </Text>
                  </View>
                )}

                {selectedDevice.lastSignalTime && (
                  <View style={styles.deviceDetailRow}>
                    <Text style={styles.deviceLabel}>Last Signal Time:</Text>
                    <Text style={styles.deviceValue}>
                      {new Date(selectedDevice.lastSignalTime).toLocaleString()}
                    </Text>
                  </View>
                )}

                {selectedDevice.location && (
                  <View style={styles.deviceDetailRow}>
                    <Text style={styles.deviceLabel}>Location:</Text>
                    <Text style={styles.deviceValue}>
                      {selectedDevice.location.address || 'Not available'}
                    </Text>
                  </View>
                )}

                <View style={styles.deviceDetailRow}>
                  <Text style={styles.deviceLabel}>Device ID:</Text>
                  <Text style={[styles.deviceValue, styles.deviceIdSmall]}>
                    {selectedDevice._id || selectedDevice.id || 'N/A'}
                  </Text>
                </View>

                {selectedDevice.maintenanceHistory && selectedDevice.maintenanceHistory.length > 0 && (
                  <>
                    <View style={styles.sectionDivider} />
                    <Text style={styles.sectionTitle}>🔧 Maintenance History</Text>
                    {selectedDevice.maintenanceHistory.map((history, index) => (
                      <View key={history._id || index} style={styles.maintenanceCard}>
                        <View style={styles.maintenanceHeader}>
                          <Text style={styles.maintenanceAction}>
                            {history.action.charAt(0).toUpperCase() + history.action.slice(1)}
                          </Text>
                          <Text style={styles.maintenanceDate}>
                            {new Date(history.date).toLocaleDateString()}
                          </Text>
                        </View>
                        {history.notes && (
                          <Text style={styles.maintenanceNotes}>{history.notes}</Text>
                        )}
                        {history.technicianId && (
                          <Text style={styles.maintenanceTechnician}>
                            👤 {history.technicianId.name || history.technicianId.displayName}
                          </Text>
                        )}
                        {history.workOrderId && (
                          <Text style={styles.maintenanceWorkOrder}>
                            Work-OrderID:   {history.workOrderId.workOrderId}
                          </Text>
                        )}
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            ) : (
              <View style={styles.modalLoadingContainer}>
                <Text style={styles.modalLoadingText}>No device data available</Text>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setShowDeviceModal(false)}
                variant="outline"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  header: {
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  listContent: {
    padding: SPACING.medium,
  },
  binCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  binIcon: {
    fontSize: 32,
    marginRight: SPACING.small,
  },
  binId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  binArea: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  fillStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.small,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  fillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  fillStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: SPACING.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    width: 110,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  collectionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBg,
    padding: SPACING.small,
    borderRadius: 8,
    marginTop: SPACING.small,
  },
  alertIcon: {
    fontSize: 16,
    marginRight: SPACING.small,
  },
  alertText: {
    fontSize: 13,
    color: COLORS.warningText,
    fontWeight: '600',
  },
  urgentAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    padding: SPACING.small,
    borderRadius: 8,
    marginTop: SPACING.small,
  },
  urgentText: {
    fontSize: 13,
    color: COLORS.dangerText,
    fontWeight: '700',
  },
  viewDeviceButton: {
    backgroundColor: COLORS.roleTechnician,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    marginTop: SPACING.small,
    alignItems: 'center',
    backgroundColor: COLORS.success
  },
  viewDeviceButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  viewDeviceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  registerDeviceButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.small,
    paddingHorizontal: SPACING.medium,
    borderRadius: 8,
    marginTop: SPACING.small,
    alignItems: 'center',
  },
  registerDeviceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  footerLoader: {
    paddingVertical: SPACING.medium,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.large * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.medium,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.medium,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paginationButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
    backgroundColor: COLORS.roleTechnician,
  },
  paginationButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  paginationButtonTextDisabled: {
    color: COLORS.textLight,
  },
  paginationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: 'column',
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
    padding: 2,
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
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: SPACING.large,
    paddingBottom: SPACING.large * 2,
  },
  modalLoadingContainer: {
    padding: SPACING.large * 2,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalLoadingText: {
    marginTop: SPACING.medium,
    fontSize: 14,
    color: COLORS.textLight,
  },
  deviceInfoSection: {
    alignItems: 'center',
    marginBottom: SPACING.large,
    paddingBottom: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  deviceIcon: {
    fontSize: 48,
    marginBottom: SPACING.small,
  },
  deviceIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deviceDetailRow: {
    marginBottom: SPACING.medium,
  },
  deviceLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  deviceValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  deviceIdSmall: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: COLORS.textLight,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  maintenanceCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
    borderRadius: 8,
    marginBottom: SPACING.small,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  maintenanceAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  maintenanceDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  maintenanceNotes: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  maintenanceTechnician: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  maintenanceWorkOrder: {
    fontSize: 13,
    paddingTop: 5,
    color: COLORS.roleTechnician,
    fontWeight: '500',
  },
  modalFooter: {
    padding: SPACING.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default DevicesScreen;

