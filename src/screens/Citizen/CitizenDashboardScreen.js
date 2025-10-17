import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';
import DashboardHeader from '../../components/DashboardHeader';

const CitizenDashboardScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <DashboardHeader 
        title="Citizen Dashboard"
        subtitle="Waste Collection Services"
      />
      
      <ScrollView style={styles.content}>
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

export default CitizenDashboardScreen;

