import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import DashboardHeader from '../../components/DashboardHeader';

const CoordinatorDashboardScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <DashboardHeader 
        title="Coordinator Dashboard"
        subtitle="Route & Collection Management"
      />
      
      <ScrollView style={styles.content}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.large,
  },
  buttonContainer: {
    gap: SPACING.medium,
  },
});

export default CoordinatorDashboardScreen;

