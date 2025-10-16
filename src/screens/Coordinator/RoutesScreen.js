import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const RoutesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collection Routes</Text>
      <Text style={styles.placeholder}>Placeholder for viewing and monitoring collection routes</Text>
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

export default RoutesScreen;

