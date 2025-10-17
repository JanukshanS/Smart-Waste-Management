import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { COLORS, SPACING } from "../../constants/theme";
import InteractiveMap from "./InteractiveMap";

const BinMapView = ({
  bins = [],
  onBinPress,
  selectedBin,
  height = 300,
  showControls = true,
  showLegend = true,
  filteredStatus = null,
}) => {
  const [mapType, setMapType] = useState("standard");

  const handleBinPress = (bin) => {
    onBinPress?.(bin);
  };

  const handleMapTypeChange = (newMapType) => {
    setMapType(newMapType);
  };

  return (
    <Card style={styles.container}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>📍 Bin Locations</Text>
          <Text style={styles.subtitle}>
            {bins.length} bin{bins.length !== 1 ? "s" : ""}
            {filteredStatus && ` (${filteredStatus})`}
          </Text>
        </View>

        {/* Interactive Map */}
        <InteractiveMap
          bins={bins}
          onBinPress={handleBinPress}
          showBins={true}
          showRoutes={false}
          showControls={showControls}
          showLegend={showLegend}
          height={height}
          mapType={mapType}
          onMapTypeChange={handleMapTypeChange}
          filteredBinStatus={filteredStatus}
          style={styles.map}
        />

        {/* Quick Stats */}
        {bins.length > 0 && (
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {bins.filter((bin) => bin.fillLevel >= 90).length}
              </Text>
              <Text style={styles.statLabel}>Full</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {
                  bins.filter(
                    (bin) => bin.fillLevel >= 70 && bin.fillLevel < 90
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>Filling</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {bins.filter((bin) => bin.fillLevel < 70).length}
              </Text>
              <Text style={styles.statLabel}>Normal</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {bins.filter((bin) => bin.status === "offline").length}
              </Text>
              <Text style={styles.statLabel}>Offline</Text>
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 0,
  },
  header: {
    marginBottom: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  map: {
    marginHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: SPACING.medium,
    paddingBottom: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: SPACING.medium,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default BinMapView;
