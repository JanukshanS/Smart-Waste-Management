import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../src/constants/theme';
import { useAuth } from '../src/contexts/AuthContext';
import Button from '../src/components/Button';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to auth landing if not authenticated
      router.replace('/auth-landing');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.replace('/auth-landing');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth-landing
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with user info and logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          {user && <Text style={styles.userText}>{user.name || user.email}</Text>}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
    paddingTop: SPACING.medium,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.medium,
    textAlign: 'center',
  },
});
