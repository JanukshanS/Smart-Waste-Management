import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthProvider } from '../../src/contexts/AuthContext';
import LoginScreen from '../../src/screens/LoginScreen';
import { authApi } from '../../src/api';

// Mock dependencies
jest.mock('../../src/api');
jest.mock('../../src/contexts/UserDetailsContext', () => ({
  useUserDetails: () => ({
    updateUserDetails: jest.fn(),
  }),
}));
jest.spyOn(Alert, 'alert');

describe('Authentication Flow Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue(mockRouter);
  });

  const renderLoginWithAuth = () => {
    return render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
  };

  it('completes full login flow successfully', async () => {
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

    const { getByPlaceholderText, getByText } = renderLoginWithAuth();

    // Fill in login form
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    // Submit login
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    // Wait for login to complete and navigation to occur
    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123'
      });
      expect(mockRouter.replace).toHaveBeenCalledWith('/citizen');
    });
  });

  it('handles login failure and shows error', async () => {
    authApi.login.mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    const { getByPlaceholderText, getByText } = renderLoginWithAuth();

    // Fill in login form with wrong credentials
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'wrong@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');

    // Submit login
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    // Wait for error to be shown
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials'
      );
    });

    // Should not navigate on failure
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('navigates to different dashboards based on user role', async () => {
    const testCases = [
      { role: 'admin', expectedRoute: '/admin' },
      { role: 'citizen', expectedRoute: '/citizen' },
      { role: 'coordinator', expectedRoute: '/coordinator' },
      { role: 'technician', expectedRoute: '/technician' },
      { role: 'crew', expectedRoute: '/crew' },
    ];

    for (const { role, expectedRoute } of testCases) {
      jest.clearAllMocks();

      authApi.login.mockResolvedValue({
        success: true,
        data: {
          user: { id: '1', name: 'Test User', role },
          token: 'mock-token'
        }
      });

      const { getByPlaceholderText, getByText } = renderLoginWithAuth();

      // Fill and submit form
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Login'));

      // Wait for navigation
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(expectedRoute);
      });
    }
  });

  it('handles network errors gracefully', async () => {
    authApi.login.mockRejectedValue(new Error('Network error'));

    const { getByPlaceholderText, getByText } = renderLoginWithAuth();

    // Fill in form
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Submit login
    fireEvent.press(getByText('Login'));

    // Wait for error handling
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Network error occurred. Please check your connection.'
      );
    });
  });

  it('validates form before making API call', async () => {
    const { getByText } = renderLoginWithAuth();

    // Try to login without filling form
    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    // Should show validation error
    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid email'
    );

    // Should not make API call
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('shows loading state during login process', async () => {
    // Mock a delayed API response
    authApi.login.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ success: true, data: { user: {}, token: 'token' } }), 100)
      )
    );

    const { getByPlaceholderText, getByText, queryByTestId } = renderLoginWithAuth();

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Submit login
    fireEvent.press(getByText('Login'));

    // Should show loading indicator
    expect(queryByTestId('loading-indicator')).toBeTruthy();

    // Wait for completion
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeFalsy();
    });
  });

  it('navigates to signup screen', () => {
    const { getByText } = renderLoginWithAuth();

    const signupLink = getByText("Don't have an account? Sign Up");
    fireEvent.press(signupLink);

    expect(mockRouter.push).toHaveBeenCalledWith('/signup');
  });
});
