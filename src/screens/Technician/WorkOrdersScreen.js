import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "react-native-paper";
import { COLORS, SPACING } from "../../constants/theme";
import { technicianApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const WorkOrdersScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [error, setError] = useState(null);

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "assigned", label: "Assigned" },
    { value: "in-progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
  ];

  const priorityFilters = [
    { value: "all", label: "All Priority" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  useEffect(() => {
    fetchWorkOrders();
  }, [user]);

  useEffect(() => {
    filterWorkOrders();
  }, [searchQuery, selectedStatus, selectedPriority, workOrders]);

  const fetchWorkOrders = async () => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) return;

      const response = await technicianApi.getWorkOrders({
        technicianId: userId,
      });

      if (response.success) {
        setWorkOrders(response.data || []);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
      setError("Failed to load work orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterWorkOrders = () => {
    let filtered = [...workOrders];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((wo) => wo.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((wo) => wo.priority === selectedPriority);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (wo) =>
          wo.issueDescription?.toLowerCase().includes(query) ||
          wo.deviceId?.toLowerCase().includes(query) ||
          wo.binId?.toLowerCase().includes(query)
      );
    }

    setFilteredWorkOrders(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkOrders();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#FFC107";
      case "low":
        return "#4CAF50";
      default:
        return COLORS.textLight;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "assigned":
        return "#2196F3";
      case "in-progress":
        return COLORS.primary;
      case "resolved":
        return "#4CAF50";
      case "escalated":
        return "#F44336";
      default:
        return COLORS.textLight;
    }
  };

  const renderWorkOrderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/technician/work-order-details?id=${item._id}`)
      }
      activeOpacity={0.7}
    >
      <Card
        style={[
          styles.workOrderCard,
          { borderLeftColor: getPriorityColor(item.priority) },
        ]}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.badgesContainer}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.badgeText}>{item.priority}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.issueDescription} numberOfLines={2}>
            {item.issueDescription || "No description"}
          </Text>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              📱 Device: {item.deviceId || "N/A"}
            </Text>
            <Text style={styles.detailText}>🗑️ Bin: {item.binId || "N/A"}</Text>
            <Text style={styles.detailText}>
              📅 Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading work orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Work Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by device, bin, or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Status Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Status:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedStatus === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedStatus === item.value &&
                    styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Priority Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Priority:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={priorityFilters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedPriority === item.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPriority(item.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedPriority === item.value &&
                    styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Work Orders List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkOrders}
          renderItem={renderWorkOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No work orders found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.large,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  loadingText: {
    marginTop: SPACING.medium,
    color: COLORS.textLight,
  },
  searchSection: {
    padding: SPACING.large,
    paddingBottom: SPACING.small,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtersSection: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.small,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  filterButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  listContent: {
    padding: SPACING.large,
  },
  workOrderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: SPACING.medium,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    marginBottom: SPACING.small,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  issueDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  detailsContainer: {
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorContainer: {
    padding: SPACING.large,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.large * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.medium,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
  },
});

export default WorkOrdersScreen;
