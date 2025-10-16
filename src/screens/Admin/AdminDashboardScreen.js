import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import Button from '../../components/Button';

const AdminDashboardScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to the Admin Panel</Text>

      <View style={styles.buttonContainer}>
        <Button 
          title="User Management" 
          onPress={() => router.push('/admin/users')}
        />
        
        <Button 
          title="System Reports" 
          onPress={() => router.push('/admin/reports')}
        />
        
        <Button 
          title="System Health" 
          onPress={() => router.push('/admin/system-health')}
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

export default AdminDashboardScreen;

