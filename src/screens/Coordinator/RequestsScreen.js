import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const RequestsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Requests</Text>
      <Text style={styles.placeholder}>Placeholder for managing citizen waste pickup requests</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.large,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default RequestsScreen;

