import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import DashboardHeader from '../../components/DashboardHeader';

const TechnicianDashboardScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <DashboardHeader 
        title="Technician Dashboard"
        subtitle="Device Maintenance & Repairs"
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.buttonContainer}>
        <Button 
          title="Work Orders" 
          onPress={() => router.push('/technician/work-orders')}
        />
        
        <Button 
          title="Device Management" 
          onPress={() => router.push('/technician/devices')}
        />
        
        <Button 
          title="Register Device" 
          onPress={() => router.push('/technician/register-device')}
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

export default TechnicianDashboardScreen;

