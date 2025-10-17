import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('authToken');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData, token) => {
    try {
      // Store user data and token
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('authToken', token);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Error storing auth data:', error);
      return { success: false, error: 'Failed to store authentication data' };
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing auth data:', error);
      return { success: false, error: 'Failed to logout' };
    }
  };

  const signup = async (userData, token) => {
    // Same as login for now - store user data after successful signup
    return await login(userData, token);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
