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
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockLogin = jest.fn();
  const mockUpdateUserDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      login: mockLogin,
    });
    
    useUserDetails.mockReturnValue({
      updateUserDetails: mockUpdateUserDetails,
    });
    
    require('expo-router').useRouter.mockReturnValue(mockRouter);
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText("Don't have an account? Sign Up")).toBeTruthy();
  });

  it('updates form data when inputs change', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('validates empty email', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid email'
    );
  });

  it('validates invalid email format', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid email'
    );
  });

  it('validates empty password', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    fireEvent.changeText(emailInput, 'test@example.com');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter your password'
    );
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

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123'
      });
      expect(mockLogin).toHaveBeenCalledWith(mockUserData, 'mock-token');
      expect(mockUpdateUserDetails).toHaveBeenCalledWith(mockUserData);
    });
  });

  it('handles login API failure', async () => {
    authApi.login.mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Invalid credentials'
      );
    });
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

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Storage error'
      );
    });
  });

  it('shows loading indicator during login', async () => {
    authApi.login.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByText, getByPlaceholderText, queryByTestId } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    // Check if loading indicator is shown
    expect(queryByTestId('loading-indicator')).toBeTruthy();
  });

  it('navigates to signup screen', () => {
    const { getByText } = render(<LoginScreen />);

    const signupLink = getByText("Don't have an account? Sign Up");
    fireEvent.press(signupLink);

    expect(mockRouter.push).toHaveBeenCalledWith('/signup');
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

    mockLogin.mockResolvedValue({ success: true });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        { id: '1', name: 'John' },
        'token'
      );
    });
  });

  it('creates fallback user data when response structure is unexpected', async () => {
    authApi.login.mockResolvedValue({
      success: true,
      data: {} // Empty response
    });

    mockLogin.mockResolvedValue({ success: true });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-user-id',
          email: 'test@example.com',
          role: 'citizen'
        }),
        'mock-token'
      );
    });
  });

  it('handles network errors gracefully', async () => {
    authApi.login.mockRejectedValue(new Error('Network error'));

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Network error occurred. Please check your connection.'
      );
    });
  });
});
