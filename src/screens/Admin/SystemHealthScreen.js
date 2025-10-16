import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const SystemHealthScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Health</Text>
      <Text style={styles.placeholder}>Placeholder for System Health Monitoring</Text>
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

export default SystemHealthScreen;

