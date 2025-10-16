import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';

const TechnicianDashboardScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Technician Dashboard</Text>
      <Text style={styles.subtitle}>Device Maintenance & Repairs</Text>

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

export default TechnicianDashboardScreen;

