import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Card } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS, SPACING } from "../../constants/theme";
import { coordinatorApi } from "../../api";
import {
  BinFillLevelCard,
  BinLocationCard,
  BinStatusCard,
  BinCollectionCard,
  BinDeviceCard,
  BinMaintenanceCard,
  BinActionButtons,
} from "../../components/Coordinator";

const BinDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bin, setBin] = useState(null);
  const [error, setError] = useState(null);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBinDetails = async () => {
    try {
      setError(null);
      const response = await coordinatorApi.getBinById(id);
      if (response.success) {
        setBin(response.message);
      }
    } catch (err) {
      console.error("Error fetching bin details:", err);
      setError("Failed to load bin details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBinDetails();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBinDetails, 30 * 1000);
    return () => clearInterval(interval);
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBinDetails();
  };

  const handleViewOnMap = () => {
    if (!bin?.location?.coordinates) {
      Alert.alert("Error", "Location coordinates not available for this bin");
      return;
    }

    const { lat, lng } = bin.location.coordinates;
    const label = encodeURIComponent(bin.binId || "Smart Bin");

    // Create map URLs for different platforms
    const scheme = Platform.select({
      ios: "maps:",
      android: "geo:",
      default: "https:",
    });

    const url = Platform.select({
      ios: `${scheme}?q=${lat},${lng}&ll=${lat},${lng}&label=${label}`,
      android: `${scheme}${lat},${lng}?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });

    Linking.openURL(url).catch((err) => {
      console.error("Error opening map:", err);
      Alert.alert("Error", "Failed to open map application");
    });
  };

  const handleRequestMaintenance = () => {
    Alert.alert(
      "Request Maintenance",
      `Do you want to mark bin ${bin.binId} for maintenance?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const response = await coordinatorApi.requestBinMaintenance(
                id,
                true
              );
              if (response.success) {
                Alert.alert("Success", "Bin marked for maintenance");
                fetchBinDetails(); // Refresh to show updated status
              }
            } catch (err) {
              console.error("Error requesting maintenance:", err);
              Alert.alert(
                "Error",
                err.message || "Failed to request maintenance"
              );
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await coordinatorApi.updateBinStatus(id, newStatus);
      if (response.success) {
        Alert.alert("Success", `Bin status updated to ${newStatus}`);
        fetchBinDetails(); // Refresh to show updated status
      }
    } catch (err) {
      console.error("Error updating bin status:", err);
      Alert.alert("Error", err.message || "Failed to update bin status");
    } finally {
      setUpdatingStatus(false);
      setStatusMenuVisible(false);
    }
  };

  const handleStatusMenuToggle = (visible) => {
    setStatusMenuVisible(visible);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bin details...</Text>
      </View>
    );
  }

  if (error || !bin) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Bin not found"}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bin Details</Text>
          <Text style={styles.subtitle}>{bin.binId}</Text>
        </View>

        {/* Fill Level Card */}
        <BinFillLevelCard bin={bin} />

        {/* Status and Information Card */}
        <BinStatusCard
          bin={bin}
          statusMenuVisible={statusMenuVisible}
          updatingStatus={updatingStatus}
          onStatusMenuToggle={handleStatusMenuToggle}
          onStatusUpdate={handleUpdateStatus}
        />

        {/* Location Card */}
        <BinLocationCard bin={bin} />

        {/* Device Information Card */}
        <BinDeviceCard bin={bin} />

        {/* Collection History Card */}
        <BinCollectionCard bin={bin} />

        {/* Maintenance Card */}
        <BinMaintenanceCard bin={bin} />

        {/* Action Buttons */}
        <BinActionButtons
          bin={bin}
          onViewOnMap={handleViewOnMap}
          onRequestMaintenance={handleRequestMaintenance}
        />
      </View>
    </ScrollView>
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
    padding: SPACING.large,
  },
  header: {
    marginBottom: SPACING.large,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.large,
  },
  card: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 2,
    textAlign: "right",
  },
});

export default BinDetailsScreen;

