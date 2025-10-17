import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Card,
  TextInput,
  Switch,
  Button as PaperButton,
  SegmentedButtons,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { COLORS, SPACING } from "../../constants/theme";
import { coordinatorApi } from "../../api";
import Button from "../../components/Button";

const CreateRouteScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Optimization parameters
  const [fillLevelThreshold, setFillLevelThreshold] = useState(90);
  const [includeApprovedRequests, setIncludeApprovedRequests] = useState(true);
  const [maxStops, setMaxStops] = useState(50);

  // Manual route creation
  const [routeName, setRouteName] = useState("");
  const [mode, setMode] = useState("optimize"); // 'optimize' or 'manual'

  const handleOptimizeRoute = async () => {
    try {
      setLoading(true);
      const response = await coordinatorApi.optimizeRoute({
        fillLevelThreshold,
        includeApprovedRequests,
        maxStops,
      });

      if (response.success) {
        const stops = response.data.stops?.length || response.data.totalStops || 0;
        const distance = response.data.totalDistance || 0;
        const duration = response.data.estimatedDuration || 0;

        if (stops === 0) {
          Alert.alert(
            "No Route Generated",
            `No bins or requests found matching your criteria.\n\n` +
            `Try lowering the fill level threshold (currently ${fillLevelThreshold}%) ` +
            `or check if there are any active bins in the system.`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Route Optimized Successfully! ✅",
            `Generated route with:\n` +
            `• ${stops} stops\n` +
            `• ${distance.toFixed(1)} km total distance\n` +
            `• ${Math.round(duration)} minutes estimated duration`,
            [
              {
                text: "View Routes",
                onPress: () => router.push("/coordinator/routes"),
              },
              { text: "OK", style: "cancel" },
            ]
          );
        }
      } else {
        Alert.alert(
          "Optimization Failed",
          response.message || "Failed to optimize route"
        );
      }
    } catch (err) {
      console.error("Error optimizing route:", err);
      
      // Detailed error handling
      let errorMessage = "Failed to optimize route";
      if (err.status === 408) {
        errorMessage = "Request timeout. Please check your connection and try again.";
      } else if (err.status === 500) {
        errorMessage = "Server error. Please contact support if this persists.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert("Error", "Please enter a route name");
      return;
    }

    try {
      setLoading(true);
      const response = await coordinatorApi.createRoute({
        routeName: routeName.trim(),
        stops: [], // Empty stops for now
        status: "draft",
      });

      if (response.success) {
        Alert.alert("Success", "Route created successfully", [
          {
            text: "View Routes",
            onPress: () => router.push("/coordinator/routes"),
          },
          { text: "OK", style: "cancel" },
        ]);
        setRouteName("");
      }
    } catch (err) {
      console.error("Error creating route:", err);
      Alert.alert("Error", err.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Route</Text>
        <Text style={styles.subtitle}>
          Generate optimized collection routes
        </Text>
      </View>

      {/* Mode Selection */}
      <View style={styles.modeContainer}>
        <PaperButton
          mode={mode === "optimize" ? "contained" : "outlined"}
          onPress={() => setMode("optimize")}
          style={[
            styles.modeButton,
            mode === "optimize" && styles.modeButtonActive,
          ]}
        >
          Optimize Route
        </PaperButton>
        <PaperButton
          mode={mode === "manual" ? "contained" : "outlined"}
          onPress={() => setMode("manual")}
          style={[
            styles.modeButton,
            mode === "manual" && styles.modeButtonActive,
          ]}
        >
          Manual Route
        </PaperButton>
      </View>

      {/* Optimize Route Mode */}
      {mode === "optimize" && (
        <Card style={styles.card}>
          <Card.Title title="Route Optimization Settings" />
          <Card.Content>
            <Text style={styles.sectionDescription}>
              Configure parameters for automatic route generation
            </Text>

            {/* Fill Level Threshold */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingLabel}>
                Fill Level Threshold: {fillLevelThreshold}%
              </Text>
              <Text style={styles.settingDescription}>
                Include bins with fill level at or above this threshold
              </Text>
              <Slider
                value={fillLevelThreshold}
                onValueChange={setFillLevelThreshold}
                minimumValue={50}
                maximumValue={100}
                step={5}
                style={styles.slider}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#CCCCCC"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>50%</Text>
                <Text style={styles.sliderLabelText}>100%</Text>
              </View>
            </View>

            {/* Include Approved Requests */}
            <View style={styles.settingContainer}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.settingLabel}>
                    Include Approved Requests
                  </Text>
                  <Text style={styles.settingDescription}>
                    Add approved waste pickup requests to the route
                  </Text>
                </View>
                <Switch
                  value={includeApprovedRequests}
                  onValueChange={setIncludeApprovedRequests}
                  color={COLORS.primary}
                />
              </View>
            </View>

            {/* Max Stops */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingLabel}>Maximum Stops: {maxStops}</Text>
              <Text style={styles.settingDescription}>
                Limit the number of stops in the route
              </Text>
              <Slider
                value={maxStops}
                onValueChange={setMaxStops}
                minimumValue={10}
                maximumValue={100}
                step={5}
                style={styles.slider}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#CCCCCC"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>10</Text>
                <Text style={styles.sliderLabelText}>100</Text>
              </View>
            </View>

            {/* Generate Button */}
            <Button
              title={loading ? "Generating..." : "Generate Optimized Route"}
              onPress={handleOptimizeRoute}
              disabled={loading}
              style={styles.generateButton}
            />
          </Card.Content>
        </Card>
      )}

      {/* Manual Route Mode */}
      {mode === "manual" && (
        <Card style={styles.card}>
          <Card.Title title="Manual Route Creation" />
          <Card.Content>
            <Text style={styles.sectionDescription}>
              Create a custom route and add stops manually
            </Text>

            {/* Route Name */}
            <TextInput
              mode="outlined"
              label="Route Name"
              placeholder="e.g., Morning Collection - Zone A"
              value={routeName}
              onChangeText={setRouteName}
              style={styles.input}
              disabled={loading}
            />

            <Text style={styles.infoText}>
              After creating the route, you can add stops from the bins and
              requests lists.
            </Text>

            {/* Create Button */}
            <Button
              title={loading ? "Creating..." : "Create Draft Route"}
              onPress={handleCreateManualRoute}
              disabled={loading || !routeName.trim()}
              style={styles.generateButton}
            />
          </Card.Content>
        </Card>
      )}

      {/* Information Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.infoTitle}>💡 Route Creation Tips</Text>
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              • Optimized routes prioritize bins with high fill levels
            </Text>
            <Text style={styles.tipText}>
              • Include approved requests to combine bin collection and pickups
            </Text>
            <Text style={styles.tipText}>
              • Adjust max stops to balance route efficiency and duration
            </Text>
            <Text style={styles.tipText}>
              • Manual routes give you complete control over stop sequence
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.large,
    paddingBottom: SPACING.small,
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
  modeContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.large,
    gap: SPACING.small,
    marginBottom: SPACING.medium,
  },
  modeButton: {
    flex: 1,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  card: {
    marginHorizontal: SPACING.large,
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  settingContainer: {
    marginBottom: SPACING.large,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: SPACING.small,
  },
  slider: {
    width: "100%",
    marginVertical: SPACING.small,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  input: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.medium,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: "italic",
    marginBottom: SPACING.medium,
  },
  generateButton: {
    marginTop: SPACING.small,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  tipContainer: {
    gap: SPACING.small,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default CreateRouteScreen;
