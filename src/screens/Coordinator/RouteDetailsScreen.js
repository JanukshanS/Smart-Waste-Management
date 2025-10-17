import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Portal,
  Dialog,
  TextInput,
  RadioButton,
  ProgressBar,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import { coordinatorApi } from '../../api';
import { InteractiveMap } from "../../components/Coordinator";

const RouteDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  // Dialog states
  const [assignDialogVisible, setAssignDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [stopDialogVisible, setStopDialogVisible] = useState(false);

  // Assignment form
  const [crews, setCrews] = useState([]);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [crewId, setCrewId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [crewsLoading, setCrewsLoading] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  // Stop update form
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState(null);

  // Map view state
  const [showMapView, setShowMapView] = useState(false);
  const [stopStatus, setStopStatus] = useState("");
  const [stopReason, setStopReason] = useState("");
  const [stopLoading, setStopLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRouteDetails();
    }
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getRouteById(id);
      if (response.success) {
        setRoute(response.data);
      }
    } catch (err) {
      console.error("Error fetching route details:", err);
      setError("Failed to load route details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRouteDetails();
  };

  const fetchAvailableCrews = async () => {
    try {
      setCrewsLoading(true);
      const response = await coordinatorApi.getCrews({ status: "active" });
      if (response.success) {
        // Filter to show only available or assigned crews
        const availableCrews = response.data.filter(
          (crew) =>
            crew.availability === "available" ||
            crew.profile?.availability === "available"
        );
        setCrews(availableCrews);
      }
    } catch (err) {
      console.error("Error fetching crews:", err);
      Alert.alert("Error", "Failed to load crews");
    } finally {
      setCrewsLoading(false);
    }
  };

  const handleOpenAssignDialog = () => {
    setAssignDialogVisible(true);
    fetchAvailableCrews();
  };

  const handleAssignRoute = async () => {
    if (!selectedCrew || !vehicleId.trim()) {
      Alert.alert("Error", "Please select a crew member and enter Vehicle ID");
      return;
    }

    try {
      setAssignLoading(true);
      const response = await coordinatorApi.assignRoute(id, {
        crewId: selectedCrew._id,
        vehicleId: vehicleId.trim(),
      });

      if (response.success) {
        Alert.alert("Success", "Route assigned successfully");
        setAssignDialogVisible(false);
        setSelectedCrew(null);
        setVehicleId("");
        fetchRouteDetails();
      }
    } catch (err) {
      console.error("Error assigning route:", err);
      Alert.alert("Error", err.message || "Failed to assign route");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      Alert.alert("Error", "Please select a status");
      return;
    }

    // Confirmation for irreversible changes
    if (newStatus === "completed" || newStatus === "cancelled") {
      Alert.alert(
        "Confirm Status Change",
        `Are you sure you want to mark this route as ${newStatus}? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            style: "destructive",
            onPress: () => updateStatus(),
          },
        ]
      );
    } else {
      updateStatus();
    }
  };

  const updateStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await coordinatorApi.updateRouteStatus(id, newStatus);

      if (response.success) {
        Alert.alert("Success", "Route status updated successfully");
        setStatusDialogVisible(false);
        setNewStatus("");
        fetchRouteDetails();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      Alert.alert("Error", err.message || "Failed to update route status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenStopDialog = (stop, index) => {
    setSelectedStop(stop);
    setSelectedStopIndex(index);
    setStopStatus(stop.status || "pending");
    setStopReason("");
    setStopDialogVisible(true);
  };

  const handleUpdateStop = async () => {
    if (stopStatus === "skipped" && !stopReason.trim()) {
      Alert.alert("Error", "Please provide a reason for skipping this stop");
      return;
    }

    try {
      setStopLoading(true);
      const response = await coordinatorApi.updateStopStatus(
        id,
        selectedStopIndex,
        {
          status: stopStatus,
          reason: stopReason.trim() || undefined,
        }
      );

      if (response.success) {
        Alert.alert("Success", "Stop status updated successfully");
        setStopDialogVisible(false);
        setSelectedStop(null);
        setSelectedStopIndex(null);
        setStopReason("");
        fetchRouteDetails();
      }
    } catch (err) {
      console.error("Error updating stop:", err);
      Alert.alert("Error", err.message || "Failed to update stop status");
    } finally {
      setStopLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "#9E9E9E";
      case "assigned":
        return "#2196F3";
      case "in-progress":
        return "#FFA500";
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const getStopStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "skipped":
        return COLORS.error;
      case "pending":
      default:
        return "#9E9E9E";
    }
  };

  const calculateCompletionPercentage = () => {
    if (!route || !route.stops || route.stops.length === 0) return 0;
    const completedStops = route.stops.filter(
      (stop) => stop.status === "completed"
    ).length;
    return Math.round((completedStops / route.stops.length) * 100);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading route details...</Text>
      </View>
    );
  }

  if (error || !route) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Route not found"}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const completionPercentage = calculateCompletionPercentage();
  const statusColor = getStatusColor(route.status);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Route Header */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.title}>{route.routeName}</Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>
                  {route.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Route Metrics */}
            <View style={styles.metricsContainer}>
              {route.stops && route.stops.length > 0 && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{route.stops.length}</Text>
                  <Text style={styles.metricLabel}>Stops</Text>
                </View>
              )}
              {route.totalDistance && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {route.totalDistance.toFixed(1)} km
                  </Text>
                  <Text style={styles.metricLabel}>Distance</Text>
                </View>
              )}
              {route.estimatedDuration && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {Math.round(route.estimatedDuration)} min
                  </Text>
                  <Text style={styles.metricLabel}>Duration</Text>
                </View>
              )}
            </View>

            {/* Progress Bar */}
            {(route.status === "in-progress" ||
              route.status === "assigned") && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>
                  Completion: {completionPercentage}%
                </Text>
                <ProgressBar
                  progress={completionPercentage / 100}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
              </View>
            )}

            {/* Assignment Info */}
            {route.crewId && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Crew: </Text>
                {typeof route.crewId === 'object' ? route.crewId.name || route.crewId._id : route.crewId}
              </Text>
            )}
            {route.vehicleId && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Vehicle ID: </Text>
                {route.vehicleId}
              </Text>
            )}
            {route.scheduledDate && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Scheduled: </Text>
                {new Date(route.scheduledDate).toLocaleDateString()}
              </Text>
            )}
            {route.createdAt && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Created: </Text>
                {new Date(route.createdAt).toLocaleDateString()}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        {route.status !== "completed" && route.status !== "cancelled" && (
          <View style={styles.actionsContainer}>
            {!route.crewId && (
              <Button title="Assign Route" onPress={handleOpenAssignDialog} />
            )}
            <Button
              title="Update Status"
              onPress={() => {
                setNewStatus(route.status);
                setStatusDialogVisible(true);
              }}
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Route Map */}
        {route.stops && route.stops.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.mapHeader}>
                <Text style={styles.sectionTitle}>Route Visualization</Text>
                <TouchableOpacity
                  style={styles.mapToggleButton}
                  onPress={() => setShowMapView(!showMapView)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.mapToggleText}>
                    {showMapView ? "📋 List View" : "🗺️ Map View"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showMapView && (
                <View style={styles.mapContainer}>
                  <InteractiveMap
                    bins={[]} // No bins for route view
                    routes={[route]}
                    showBins={false}
                    showRoutes={true}
                    showControls={true}
                    showLegend={true}
                    height={300}
                    style={styles.routeMap}
                  />
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Stops List */}
        {route.stops && route.stops.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Route Stops</Text>
              {route.stops.map((stop, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOpenStopDialog(stop, index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.stopItem}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopNumber}>#{index + 1}</Text>
                      <View
                        style={[
                          styles.stopStatusBadge,
                          {
                            backgroundColor: getStopStatusColor(
                              stop.status || "pending"
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.stopStatusText}>
                          {stop.status?.toUpperCase() || "PENDING"}
                        </Text>
                      </View>
                    </View>

                    {stop.type && (
                      <Text style={styles.stopText}>
                        <Text style={styles.stopLabel}>Type: </Text>
                        {stop.type}
                      </Text>
                    )}

                    {stop.location && (
                      <Text style={styles.stopText}>
                        <Text style={styles.stopLabel}>Location: </Text>
                        {stop.location.address ||
                          `${stop.location.lat?.toFixed(
                            4
                          )}, ${stop.location.lng?.toFixed(4)}`}
                      </Text>
                    )}

                    {stop.binId && (
                      <Text style={styles.stopText}>
                        <Text style={styles.stopLabel}>Bin ID: </Text>
                        {stop.binId}
                      </Text>
                    )}

                    {stop.requestId && (
                      <Text style={styles.stopText}>
                        <Text style={styles.stopLabel}>Request ID: </Text>
                        {stop.requestId}
                      </Text>
                    )}

                    {stop.reason && (
                      <Text style={[styles.stopText, { color: COLORS.error }]}>
                        <Text style={styles.stopLabel}>Reason: </Text>
                        {stop.reason}
                      </Text>
                    )}

                    <Text style={styles.tapHint}>Tap to update status</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Assignment Dialog */}
      <Portal>
        <Dialog
          visible={assignDialogVisible}
          onDismiss={() => setAssignDialogVisible(false)}
        >
          <Dialog.Title>Assign Route</Dialog.Title>
          <Dialog.Content>
            {crewsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading crews...</Text>
              </View>
            ) : crews.length === 0 ? (
              <Text style={styles.noCrewsText}>
                No available crew members found. Please create crew members
                first.
              </Text>
            ) : (
              <>
                <Text style={styles.dialogLabel}>Select Crew Member *</Text>
                <ScrollView style={styles.crewList} nestedScrollEnabled>
                  {crews.map((crew) => (
                    <TouchableOpacity
                      key={crew._id}
                      style={[
                        styles.crewItem,
                        selectedCrew?._id === crew._id &&
                          styles.crewItemSelected,
                      ]}
                      onPress={() => setSelectedCrew(crew)}
                      disabled={assignLoading}
                    >
                      <View style={styles.crewItemContent}>
                        <Text style={styles.crewName}>{crew.name}</Text>
                        <Text style={styles.crewEmail}>{crew.email}</Text>
                        {crew.profile?.vehicleId && (
                          <Text style={styles.crewVehicle}>
                            🚛 {crew.profile.vehicleId}
                          </Text>
                        )}
                      </View>
                      {selectedCrew?._id === crew._id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
            <TextInput
              mode="outlined"
              label="Vehicle ID *"
              placeholder="Enter vehicle identifier"
              value={vehicleId}
              onChangeText={setVehicleId}
              style={styles.input}
              disabled={assignLoading || crewsLoading}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              onPress={() => setAssignDialogVisible(false)}
              disabled={assignLoading}
            />
            <Button
              title={assignLoading ? "Assigning..." : "Assign"}
              onPress={handleAssignRoute}
              disabled={assignLoading || crewsLoading || crews.length === 0}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Status Update Dialog */}
      <Portal>
        <Dialog
          visible={statusDialogVisible}
          onDismiss={() => setStatusDialogVisible(false)}
        >
          <Dialog.Title>Update Route Status</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setNewStatus} value={newStatus}>
              <View style={styles.radioItem}>
                <RadioButton value="draft" />
                <Text style={styles.radioLabel}>Draft</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="assigned" />
                <Text style={styles.radioLabel}>Assigned</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="in-progress" />
                <Text style={styles.radioLabel}>In Progress</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="completed" />
                <Text style={styles.radioLabel}>Completed</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="cancelled" />
                <Text style={styles.radioLabel}>Cancelled</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              onPress={() => setStatusDialogVisible(false)}
              disabled={statusLoading}
            />
            <Button
              title={statusLoading ? "Updating..." : "Update"}
              onPress={handleUpdateStatus}
              disabled={statusLoading}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Stop Status Dialog */}
      <Portal>
        <Dialog
          visible={stopDialogVisible}
          onDismiss={() => setStopDialogVisible(false)}
        >
          <Dialog.Title>Update Stop Status</Dialog.Title>
          <Dialog.Content>
            {selectedStop && (
              <>
                <Text style={styles.dialogInfo}>
                  Stop #{selectedStopIndex + 1}
                </Text>
                <RadioButton.Group
                  onValueChange={setStopStatus}
                  value={stopStatus}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="pending" />
                    <Text style={styles.radioLabel}>Pending</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="completed" />
                    <Text style={styles.radioLabel}>Completed</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="skipped" />
                    <Text style={styles.radioLabel}>Skipped</Text>
                  </View>
                </RadioButton.Group>

                {stopStatus === "skipped" && (
                  <TextInput
                    mode="outlined"
                    label="Reason for skipping *"
                    placeholder="Enter reason..."
                    value={stopReason}
                    onChangeText={setStopReason}
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    disabled={stopLoading}
                  />
                )}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              onPress={() => setStopDialogVisible(false)}
              disabled={stopLoading}
            />
            <Button
              title={stopLoading ? "Updating..." : "Update"}
              onPress={handleUpdateStop}
              disabled={stopLoading}
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  content: {
    flex: 1,
    padding: SPACING.large,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.large,
    fontSize: 16,
  },
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.small,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.white,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.medium,
    paddingVertical: SPACING.medium,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: SPACING.medium,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "600",
  },
  actionsContainer: {
    gap: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  actionButton: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  mapToggleButton: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
  },
  mapToggleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  mapContainer: {
    marginTop: SPACING.small,
  },
  routeMap: {
    borderRadius: 8,
  },
  stopItem: {
    padding: SPACING.medium,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: SPACING.small,
  },
  stopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  stopNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  stopStatusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stopStatusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.white,
  },
  stopText: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 2,
  },
  stopLabel: {
    fontWeight: "600",
  },
  tapHint: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginTop: 4,
  },
  input: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  radioLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: SPACING.small,
  },
  dialogInfo: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.medium,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.medium,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  crewList: {
    maxHeight: 200,
    marginBottom: SPACING.medium,
  },
  crewItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.medium,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: SPACING.small,
    borderWidth: 2,
    borderColor: "transparent",
  },
  crewItemSelected: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary,
  },
  crewItemContent: {
    flex: 1,
  },
  crewName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  crewEmail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  crewVehicle: {
    fontSize: 12,
    color: COLORS.text,
  },
  checkmark: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  noCrewsText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginVertical: SPACING.medium,
  },
});

export default RouteDetailsScreen;

