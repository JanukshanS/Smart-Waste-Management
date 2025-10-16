import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';

const CitizenDashboardScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Citizen Dashboard</Text>
      <Text style={styles.subtitle}>Waste Collection Services</Text>

      <View style={styles.buttonContainer}>
        <Button 
          title="Create Request" 
          onPress={() => router.push('/citizen/create-request')}
        />
        
        <Button 
          title="My Requests" 
          onPress={() => router.push('/citizen/my-requests')}
        />
        
        <Button 
          title="Track Request" 
          onPress={() => router.push('/citizen/track-request')}
        />
        
        <Button 
          title="Find Bins" 
          onPress={() => router.push('/citizen/find-bins')}
        />
        
        <Button 
          title="Profile" 
          onPress={() => router.push('/citizen/profile')}
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

export default CitizenDashboardScreen;

