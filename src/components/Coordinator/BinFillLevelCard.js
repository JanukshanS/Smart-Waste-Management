import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { COLORS, SPACING } from '../../constants/theme';

const BinFillLevelCard = ({ bin }) => {
  const getFillLevelColor = (fillLevel) => {
    if (fillLevel >= 90) return COLORS.error;
    if (fillLevel >= 70) return "#FFA500";
    return "#4CAF50";
  };

  const getFillLevelLabel = (fillLevel) => {
    if (fillLevel >= 90) return "Full - Needs Collection";
    if (fillLevel >= 70) return "Filling - Monitor Closely";
    return "Normal Level";
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Current Fill Level</Text>
        <View style={styles.fillLevelContainer}>
          <Text
            style={[
              styles.fillLevelText,
              { color: getFillLevelColor(bin.fillLevel) },
            ]}
          >
            {bin.fillLevel}%
          </Text>
          <ProgressBar
            progress={bin.fillLevel / 100}
            color={getFillLevelColor(bin.fillLevel)}
            style={styles.progressBar}
          />
          <Text style={styles.fillLevelLabel}>
            {getFillLevelLabel(bin.fillLevel)}
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
  fillLevelContainer: {
    alignItems: "center",
  },
  fillLevelText: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: SPACING.small,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    width: "100%",
    marginBottom: SPACING.small,
  },
  fillLevelLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default BinFillLevelCard;
