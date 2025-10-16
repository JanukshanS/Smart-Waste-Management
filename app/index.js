import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../src/constants/theme';
import Button from '../src/components/Button';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Smart Waste Management System</Text>
      <Text style={styles.subtitle}>Select your role to continue</Text>
      
      <View style={styles.buttonContainer}>
        <Text style={styles.sectionTitle}>👤 User Roles</Text>
        
        <Button 
          title="👨‍💼 Admin Dashboard" 
          onPress={() => router.push('/admin')}
        />
        
        <Button 
          title="👨‍👩‍👧‍👦 Citizen Portal" 
          onPress={() => router.push('/citizen')}
        />
        
        <Button 
          title="🗺️ Coordinator Dashboard" 
          onPress={() => router.push('/coordinator')}
        />
        
        <Button 
          title="🔧 Technician Dashboard" 
          onPress={() => router.push('/technician')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
});
