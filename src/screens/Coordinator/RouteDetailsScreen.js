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
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [crewsLoading, setCrewsLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

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
      if (response.success && response.data) {
        // Filter to show only available or assigned crews
        const availableCrews = response.data.filter((crew) => {
          const availability = crew.availability || crew.profile?.availability;
          return availability === "available" || availability === "assigned";
        });
        setCrews(availableCrews);
      } else {
        console.error("Invalid response structure:", response);
        Alert.alert("Error", "Invalid response from server");
      }
    } catch (err) {
      console.error("Error fetching crews:", err);
      setCrews([]);
      Alert.alert("Error", "Failed to load crews");
    } finally {
      setCrewsLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const response = await coordinatorApi.getAvailableVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
        setFilteredVehicles(response.data);
        setVehicleSearchQuery("");
      } else {
        console.error("Invalid response structure:", response);
        Alert.alert("Error", "Invalid response from server");
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      Alert.alert("Error", err.message || "Failed to fetch vehicles");
    } finally {
      setVehiclesLoading(false);
    }
  };

  // Filter vehicles based on search query
  const handleVehicleSearch = (query) => {
    setVehicleSearchQuery(query);
    if (!query.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.vehicleId?.toLowerCase().includes(searchLower) ||
        vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
        vehicle.vehicleType?.toLowerCase().includes(searchLower) ||
        vehicle.manufacturer?.toLowerCase().includes(searchLower) ||
        vehicle.model?.toLowerCase().includes(searchLower)
    );
    setFilteredVehicles(filtered);
  };

  const handleOpenAssignDialog = () => {
    setAssignDialogVisible(true);
    fetchAvailableCrews();
    fetchAvailableVehicles();
  };

  const handleAssignRoute = async () => {
    if (!selectedCrew || !selectedVehicle) {
      Alert.alert("Error", "Please select both a crew member and a vehicle");
      return;
    }

    try {
      setAssignLoading(true);
      const response = await coordinatorApi.assignRoute(id, {
        crewId: selectedCrew._id,
        vehicleId: selectedVehicle._id || selectedVehicle.vehicleId,
      });

      if (response.success) {
        Alert.alert("Success", "Route assigned successfully");
        setAssignDialogVisible(false);
        setSelectedCrew(null);
        setSelectedVehicle(null);
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
                {typeof route.crewId === "object"
                  ? route.crewId.name
                  : route.crewId}
              </Text>
            )}
            {route.vehicleId && (
              <Text style={styles.infoText}>
                <Text style={styles.infoLabel}>Vehicle ID: </Text>
                {typeof route.vehicleId === "object"
                  ? route.vehicleId._id
                  : route.vehicleId}
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

            {/* Vehicle Selection */}
            <Text style={styles.sectionLabel}>Select Vehicle *</Text>
            {vehiclesLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginVertical: SPACING.medium }}
              />
            ) : vehicles.length > 0 ? (
              <>
                {/* Vehicle Search Input */}
                <TextInput
                  mode="outlined"
                  label="Search vehicles"
                  placeholder="Search by ID, plate, type, or manufacturer..."
                  value={vehicleSearchQuery}
                  onChangeText={handleVehicleSearch}
                  style={styles.searchInput}
                  left={<TextInput.Icon icon="magnify" />}
                  right={
                    vehicleSearchQuery ? (
                      <TextInput.Icon
                        icon="close"
                        onPress={() => handleVehicleSearch("")}
                      />
                    ) : null
                  }
                />

                {filteredVehicles.length === 0 ? (
                  <Text style={styles.noResultsText}>
                    No vehicles found matching "{vehicleSearchQuery}"
                  </Text>
                ) : (
                  <>
                    <Text style={styles.vehicleCountText}>
                      {filteredVehicles.length} vehicle
                      {filteredVehicles.length !== 1 ? "s" : ""} available
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.vehicleScrollView}
                      contentContainerStyle={styles.vehicleScrollContent}
                      nestedScrollEnabled
                    >
                      {filteredVehicles.map((vehicle) => (
                        <TouchableOpacity
                          key={vehicle._id}
                          style={[
                            styles.vehicleItem,
                            selectedVehicle?._id === vehicle._id &&
                              styles.vehicleItemSelected,
                            vehicle.status !== "available" &&
                              styles.vehicleItemDisabled,
                          ]}
                          onPress={() => setSelectedVehicle(vehicle)}
                          disabled={assignLoading || vehiclesLoading}
                        >
                          <View style={styles.vehicleItemContent}>
                            <Text style={styles.vehicleId}>
                              {vehicle.vehicleId}
                            </Text>
                            <Text style={styles.vehiclePlate}>
                              {vehicle.licensePlate}
                            </Text>
                            <Text style={styles.vehicleType}>
                              {vehicle.vehicleType} • {vehicle.capacity}m³
                            </Text>
                            <Text
                              style={[
                                styles.vehicleStatus,
                                {
                                  color:
                                    vehicle.status === "available"
                                      ? "#4CAF50"
                                      : "#FFA500",
                                },
                              ]}
                            >
                              {vehicle.status === "available"
                                ? "✓ Available"
                                : "◉ In Use"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {selectedVehicle && (
                      <View style={styles.selectedVehicleInfo}>
                        <Text style={styles.selectedLabel}>Selected:</Text>
                        <Text style={styles.selectedValue}>
                          {selectedVehicle.vehicleId} (
                          {selectedVehicle.licensePlate})
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : (
              <View style={styles.noVehiclesContainer}>
                <Text style={styles.noVehiclesText}>No vehicles available</Text>
                <Button
                  title="Manage Vehicles"
                  onPress={() => {
                    setAssignDialogVisible(false);
                    router.push("/coordinator/vehicles");
                  }}
                  style={{ marginTop: SPACING.small }}
                />
              </View>
            )}
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
    marginTop: SPACING.medium,
  },
  vehicleScrollView: {
    flexGrow: 0,
    marginBottom: SPACING.small,
  },
  vehicleScrollContent: {
    paddingVertical: SPACING.small,
    paddingRight: SPACING.small,
  },
  vehicleItem: {
    width: 180,
    height: 120,
    padding: SPACING.medium,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginRight: SPACING.small,
    borderWidth: 2,
    borderColor: "transparent",
    justifyContent: "space-between",
  },
  vehicleItemSelected: {
    backgroundColor: COLORS.primary + "15",
    borderColor: COLORS.primary,
  },
  vehicleItemDisabled: {
    opacity: 0.5,
  },
  vehicleItemContent: {
    flex: 0,
  },
  vehicleId: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: "monospace",
    marginBottom: 8,
  },
  vehicleType: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
  },
  vehicleStatus: {
    fontSize: 11,
    fontWeight: "600",
  },
  selectedVehicleInfo: {
    padding: SPACING.small,
    backgroundColor: "#E8F5E9",
    borderRadius: 4,
    marginBottom: SPACING.medium,
  },
  selectedLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  noVehiclesContainer: {
    padding: SPACING.large,
    alignItems: "center",
  },
  noVehiclesText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.small,
  },
  searchInput: {
    marginBottom: SPACING.small,
    backgroundColor: COLORS.white,
  },
  vehicleCountText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.small,
    fontStyle: "italic",
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginVertical: SPACING.medium,
    fontStyle: "italic",
  },
});

export default RouteDetailsScreen;

