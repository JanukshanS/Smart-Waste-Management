import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../Button';

const IconButton = ({ title, icon, onPress, style, iconColor = COLORS.white }) => {
  return (
    <Button 
      title={
        <View style={styles.iconButtonContent}>
          <MaterialCommunityIcons
            name={icon}
            size={18}
            color={iconColor}
            style={styles.iconButtonIcon}
          />
          <Text style={styles.iconButtonText}>{title}</Text>
        </View>
      } 
      onPress={onPress} 
      style={style}
    />
  );
};

const BinActionButtons = ({ bin, onViewOnMap, onRequestMaintenance }) => {
  const router = useRouter();

  return (
    <Card style={styles.actionCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <IconButton 
                title="View on Map" 
                icon="map-marker"
                onPress={onViewOnMap}
                style={styles.actionButton}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <IconButton
                title="Collection History"
                icon="history"
                onPress={() =>
                  router.push(`/coordinator/collection-history?binId=${bin.binId}`)
                }
                style={styles.actionButton}
              />
            </View>
          </View>
          <View style={styles.buttonRow}>
            <View style={styles.fullWidthButton}>
              <IconButton
                title="Request Maintenance"
                icon="wrench"
                onPress={onRequestMaintenance}
                style={styles.maintenanceButton}
              />
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    marginBottom: SPACING.large,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  buttonGrid: {
    gap: SPACING.medium,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  buttonWrapper: {
    flex: 1,
  },
  fullWidthButton: {
    width: "100%",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    marginVertical: 0,
    paddingVertical: SPACING.small,
  },
  maintenanceButton: {
    backgroundColor: COLORS.error,
    marginVertical: 0,
    paddingVertical: SPACING.small,
  },
  iconButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonIcon: {
    marginRight: SPACING.small / 2,
  },
  iconButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BinActionButtons;
