import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';

const CoordinatorDashboardScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Coordinator Dashboard</Text>
      <Text style={styles.subtitle}>Route & Collection Management</Text>

      <View style={styles.buttonContainer}>
        <Button 
          title="Smart Bins" 
          onPress={() => router.push('/coordinator/bins')}
        />
        
        <Button 
          title="Manage Requests" 
          onPress={() => router.push('/coordinator/requests')}
        />
        
        <Button 
          title="Collection Routes" 
          onPress={() => router.push('/coordinator/routes')}
        />
        
        <Button 
          title="Create Route" 
          onPress={() => router.push('/coordinator/create-route')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  buttonContainer: {
    marginTop: SPACING.medium,
  },
});

export default CoordinatorDashboardScreen;

