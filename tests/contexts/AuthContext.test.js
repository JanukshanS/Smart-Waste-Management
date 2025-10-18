import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Test component to access the context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout, signup } = useAuth();
  
  return (
    <>
      <Text testID="user">{user ? JSON.stringify(user) : 'null'}</Text>
      <Text testID="isAuthenticated">{isAuthenticated.toString()}</Text>
      <Text testID="isLoading">{isLoading.toString()}</Text>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
  });

  it('provides initial state correctly', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').children[0]).toBe('null');
      expect(getByTestId('isAuthenticated').children[0]).toBe('false');
      expect(getByTestId('isLoading').children[0]).toBe('false');
    });
  });

  it('loads existing user data on initialization', async () => {
    const userData = { id: '1', name: 'John Doe', email: 'john@example.com' };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(userData)) // user data
      .mockResolvedValueOnce('mock-token'); // auth token

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').children[0]).toBe(JSON.stringify(userData));
      expect(getByTestId('isAuthenticated').children[0]).toBe('true');
      expect(getByTestId('isLoading').children[0]).toBe('false');
    });
  });

  it('handles login successfully', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();

    const TestLoginComponent = () => {
      const { login, user, isAuthenticated } = useAuth();
      
      const handleLogin = async () => {
        const userData = { id: '1', name: 'John Doe' };
        await login(userData, 'test-token');
      };

      return (
        <>
          <Text testID="user">{user ? JSON.stringify(user) : 'null'}</Text>
          <Text testID="isAuthenticated">{isAuthenticated.toString()}</Text>
          <Text testID="login-button" onPress={handleLogin}>Login</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestLoginComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isLoading').children[0]).toBe('false');
    });

    await act(async () => {
      getByTestId('login-button').props.onPress();
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: '1', name: 'John Doe' }));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
      expect(getByTestId('isAuthenticated').children[0]).toBe('true');
    });
  });

  it('handles logout successfully', async () => {
    const userData = { id: '1', name: 'John Doe' };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(userData))
      .mockResolvedValueOnce('mock-token');
    AsyncStorage.removeItem.mockResolvedValue();

    const TestLogoutComponent = () => {
      const { logout, user, isAuthenticated } = useAuth();
      
      const handleLogout = async () => {
        await logout();
      };

      return (
        <>
          <Text testID="user">{user ? JSON.stringify(user) : 'null'}</Text>
          <Text testID="isAuthenticated">{isAuthenticated.toString()}</Text>
          <Text testID="logout-button" onPress={handleLogout}>Logout</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestLogoutComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(getByTestId('isAuthenticated').children[0]).toBe('true');
    });

    await act(async () => {
      getByTestId('logout-button').props.onPress();
    });

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(getByTestId('isAuthenticated').children[0]).toBe('false');
      expect(getByTestId('user').children[0]).toBe('null');
    });
  });

  it('handles signup successfully', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();

    const TestSignupComponent = () => {
      const { signup, user, isAuthenticated } = useAuth();
      
      const handleSignup = async () => {
        const userData = { id: '1', name: 'Jane Doe', email: 'jane@example.com' };
        await signup(userData, 'signup-token');
      };

      return (
        <>
          <Text testID="user">{user ? JSON.stringify(user) : 'null'}</Text>
          <Text testID="isAuthenticated">{isAuthenticated.toString()}</Text>
          <Text testID="signup-button" onPress={handleSignup}>Signup</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestSignupComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isLoading').children[0]).toBe('false');
    });

    await act(async () => {
      getByTestId('signup-button').props.onPress();
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: '1', name: 'Jane Doe', email: 'jane@example.com' }));
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'signup-token');
      expect(getByTestId('isAuthenticated').children[0]).toBe('true');
    });
  });

  it('handles AsyncStorage errors gracefully', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').children[0]).toBe('null');
      expect(getByTestId('isAuthenticated').children[0]).toBe('false');
      expect(getByTestId('isLoading').children[0]).toBe('false');
    });
  });

  it('handles login storage errors', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const TestLoginErrorComponent = () => {
      const { login } = useAuth();
      
      const handleLogin = async () => {
        const result = await login({ id: '1' }, 'token');
        return result;
      };

      return <Text testID="login-button" onPress={handleLogin}>Login</Text>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestLoginErrorComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isLoading').children[0]).toBe('false');
    });

    let result;
    await act(async () => {
      result = await getByTestId('login-button').props.onPress();
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to store authentication data');
  });

  it('handles logout storage errors', async () => {
    const userData = { id: '1', name: 'John Doe' };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(userData))
      .mockResolvedValueOnce('mock-token');
    AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

    const TestLogoutErrorComponent = () => {
      const { logout } = useAuth();
      
      const handleLogout = async () => {
        const result = await logout();
        return result;
      };

      return <Text testID="logout-button" onPress={handleLogout}>Logout</Text>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestLogoutErrorComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isAuthenticated').children[0]).toBe('true');
    });

    let result;
    await act(async () => {
      result = await getByTestId('logout-button').props.onPress();
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to logout');
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const TestComponentOutsideProvider = () => {
      useAuth();
      return <Text>Test</Text>;
    };

    expect(() => {
      render(<TestComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('clears user data with clearUserData function', async () => {
    const userData = { id: '1', name: 'John Doe' };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(userData))
      .mockResolvedValueOnce('mock-token');

    const TestClearComponent = () => {
      const { clearUserData, user, isAuthenticated } = useAuth();
      
      return (
        <>
          <Text testID="user">{user ? JSON.stringify(user) : 'null'}</Text>
          <Text testID="isAuthenticated">{isAuthenticated.toString()}</Text>
          <Text testID="clear-button" onPress={clearUserData}>Clear</Text>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestClearComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isAuthenticated').children[0]).toBe('true');
    });

    act(() => {
      getByTestId('clear-button').props.onPress();
    });

    expect(getByTestId('isAuthenticated').children[0]).toBe('false');
    expect(getByTestId('user').children[0]).toBe('null');
  });
});
