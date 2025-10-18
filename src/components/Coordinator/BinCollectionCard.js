import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinCollectionCard = ({ bin }) => {
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

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Collection History</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Emptied:</Text>
          <Text style={styles.infoValue}>
            {formatDate(bin.lastEmptied)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Collections:</Text>
          <Text style={styles.infoValue}>{bin.collectionCount || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated:</Text>
          <Text style={styles.infoValue}>
            {formatDate(bin.lastUpdated)}
          </Text>
        </View>
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

export default BinCollectionCard;
