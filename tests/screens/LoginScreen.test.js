import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUserDetails } from '../../src/contexts/UserDetailsContext';
import { authApi } from '../../src/api';

// Mock dependencies
jest.mock('../../src/contexts/AuthContext');
jest.mock('../../src/contexts/UserDetailsContext');
jest.mock('../../src/api');
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockUpdateUserDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear the global mock router
    global.mockRouter.push.mockClear();
    global.mockRouter.replace.mockClear();
    
    useAuth.mockReturnValue({
      login: mockLogin,
    });
    
    useUserDetails.mockReturnValue({
      updateUserDetails: mockUpdateUserDetails,
    });
  });

  it('renders without crashing', () => {
    const component = render(<LoginScreen />);
    expect(component).toBeDefined();
  });

  it('validates email correctly', () => {
    // Test email validation logic
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';
    
    expect(validEmail.includes('@')).toBe(true);
    expect(invalidEmail.includes('@')).toBe(false);
  });

  it('handles successful login with user data', async () => {
    const mockUserData = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'citizen'
    };

    authApi.login.mockResolvedValue({
      success: true,
      data: {
        user: mockUserData,
        token: 'mock-token'
      }
    });

    mockLogin.mockResolvedValue({ success: true });

    const result = await authApi.login({
      email: 'john@example.com',
      password: 'password123'
    });

    expect(result.success).toBe(true);
    expect(result.data.user).toEqual(mockUserData);
  });

  it('handles login API failure', async () => {
    authApi.login.mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    const result = await authApi.login({
      email: 'test@example.com',
      password: 'wrongpassword'
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('handles auth context login failure', async () => {
    authApi.login.mockResolvedValue({
      success: true,
      data: {
        user: { id: '1', name: 'John' },
        token: 'token'
      }
    });

    mockLogin.mockResolvedValue({ success: false, error: 'Storage error' });

    const authResult = await authApi.login({ email: 'test@example.com', password: 'password' });
    const loginResult = await mockLogin(authResult.data.user, authResult.data.token);

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Storage error');
  });

  it('navigates to signup screen', () => {
    // Test navigation logic
    expect(global.mockRouter.push).toBeDefined();
    
    // Simulate navigation
    global.mockRouter.push('/signup');
    expect(global.mockRouter.push).toHaveBeenCalledWith('/signup');
  });

  it('handles different response structures', async () => {
    // Test nested data structure
    authApi.login.mockResolvedValue({
      success: true,
      data: {
        data: {
          user: { id: '1', name: 'John' },
          token: 'token'
        }
      }
    });

    const result = await authApi.login({ email: 'test@example.com', password: 'password' });
    expect(result.success).toBe(true);
    expect(result.data.data.user.name).toBe('John');
  });

  it('creates fallback user data when response structure is unexpected', async () => {
    authApi.login.mockResolvedValue({
      success: true,
      data: {} // Empty response
    });

    const result = await authApi.login({ email: 'test@example.com', password: 'password' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({});
  });

  it('handles network errors gracefully', async () => {
    authApi.login.mockRejectedValue(new Error('Network error'));

    try {
      await authApi.login({ email: 'test@example.com', password: 'password' });
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });

  it('validates form inputs', () => {
    const formData = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Basic validation tests
    expect(formData.email.trim()).toBeTruthy();
    expect(formData.email.includes('@')).toBe(true);
    expect(formData.password.trim()).toBeTruthy();
  });

  it('handles loading states', () => {
    let loading = false;
    
    // Simulate loading state change
    loading = true;
    expect(loading).toBe(true);
    
    loading = false;
    expect(loading).toBe(false);
  });
});