import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinLocationCard = ({ bin }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Location</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Area:</Text>
          <Text style={styles.infoValue}>
            {bin.location?.area || "N/A"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>
            {bin.location?.address || "N/A"}
          </Text>
        </View>
        {bin.location?.coordinates && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coordinates:</Text>
            <Text style={styles.infoValue}>
              {bin.location.coordinates.lat?.toFixed(6)},{" "}
              {bin.location.coordinates.lng?.toFixed(6)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
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

export default BinLocationCard;
