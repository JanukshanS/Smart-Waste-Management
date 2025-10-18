import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../src/components/Button';
import DashboardHeader from '../../src/components/DashboardHeader';
import { useAuth } from '../../src/contexts/AuthContext';

// Mock dependencies
jest.mock('../../src/contexts/AuthContext');

describe('Navigation Flow Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('expo-router').useRouter.mockReturnValue(mockRouter);
    
    useAuth.mockReturnValue({
      user: { id: '1', name: 'John Doe', email: 'john@example.com' },
      logout: mockLogout,
    });
  });

  // Mock screen component for testing navigation
  const MockScreen = ({ title, navigationTarget }) => {
    const router = useRouter();
    
    return (
      <View>
        <DashboardHeader title={title} />
        <Button 
          title={`Go to ${navigationTarget}`}
          onPress={() => router.push(`/${navigationTarget}`)}
        />
      </View>
    );
  };

  it('navigates between screens using Button component', () => {
    const { getByText } = render(
      <MockScreen title="Test Screen" navigationTarget="citizen/create-request" />
    );

    const navigationButton = getByText('Go to citizen/create-request');
    fireEvent.press(navigationButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/citizen/create-request');
  });

  it('handles back navigation', () => {
    const MockScreenWithBack = () => {
      const router = useRouter();
      
      return (
        <View>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      );
    };

    const { getByText } = render(<MockScreenWithBack />);

    const backButton = getByText('Go Back');
    fireEvent.press(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('navigates to different role dashboards', () => {
    const roles = ['admin', 'citizen', 'coordinator', 'technician', 'crew'];

    roles.forEach(role => {
      jest.clearAllMocks();

      const MockRoleNavigation = () => {
        const router = useRouter();
        
        return (
          <Button 
            title={`Go to ${role} Dashboard`}
            onPress={() => router.push(`/${role}`)}
          />
        );
      };

      const { getByText } = render(<MockRoleNavigation />);

      const roleButton = getByText(`Go to ${role} Dashboard`);
      fireEvent.press(roleButton);

      expect(mockRouter.push).toHaveBeenCalledWith(`/${role}`);
    });
  });

  it('handles nested navigation paths', () => {
    const navigationPaths = [
      '/citizen/create-request',
      '/citizen/my-requests',
      '/citizen/find-bins',
      '/admin/users',
      '/admin/reports',
      '/coordinator/bins',
      '/coordinator/routes',
      '/technician/devices',
      '/technician/work-orders'
    ];

    navigationPaths.forEach(path => {
      jest.clearAllMocks();

      const MockNestedNavigation = () => {
        const router = useRouter();
        
        return (
          <Button 
            title={`Navigate to ${path}`}
            onPress={() => router.push(path)}
          />
        );
      };

      const { getByText } = render(<MockNestedNavigation />);

      const navButton = getByText(`Navigate to ${path}`);
      fireEvent.press(navButton);

      expect(mockRouter.push).toHaveBeenCalledWith(path);
    });
  });

  it('handles replace navigation for authentication flows', () => {
    const MockAuthNavigation = () => {
      const router = useRouter();
      
      return (
        <View>
          <Button 
            title="Login Success"
            onPress={() => router.replace('/citizen')}
          />
          <Button 
            title="Logout"
            onPress={() => router.replace('/auth-landing')}
          />
        </View>
      );
    };

    const { getByText } = render(<MockAuthNavigation />);

    // Test login success navigation
    const loginButton = getByText('Login Success');
    fireEvent.press(loginButton);
    expect(mockRouter.replace).toHaveBeenCalledWith('/citizen');

    jest.clearAllMocks();

    // Test logout navigation
    const logoutButton = getByText('Logout');
    fireEvent.press(logoutButton);
    expect(mockRouter.replace).toHaveBeenCalledWith('/auth-landing');
  });

  it('handles conditional navigation based on user state', () => {
    const MockConditionalNavigation = () => {
      const router = useRouter();
      const { user } = useAuth();
      
      const handleNavigation = () => {
        if (user) {
          router.push('/citizen/profile');
        } else {
          router.push('/login');
        }
      };
      
      return (
        <Button title="Profile or Login" onPress={handleNavigation} />
      );
    };

    const { getByText } = render(<MockConditionalNavigation />);

    const conditionalButton = getByText('Profile or Login');
    fireEvent.press(conditionalButton);

    // Should navigate to profile since user is mocked as logged in
    expect(mockRouter.push).toHaveBeenCalledWith('/citizen/profile');
  });

  it('handles navigation with parameters', () => {
    const MockParameterNavigation = () => {
      const router = useRouter();
      
      return (
        <View>
          <Button 
            title="View Request Details"
            onPress={() => router.push('/citizen/track-request?id=123')}
          />
          <Button 
            title="Edit User"
            onPress={() => router.push('/admin/user-details?userId=456')}
          />
        </View>
      );
    };

    const { getByText } = render(<MockParameterNavigation />);

    // Test navigation with query parameters
    const requestButton = getByText('View Request Details');
    fireEvent.press(requestButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/citizen/track-request?id=123');

    jest.clearAllMocks();

    const userButton = getByText('Edit User');
    fireEvent.press(userButton);
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/user-details?userId=456');
  });

  it('handles navigation errors gracefully', () => {
    mockRouter.push.mockImplementation(() => {
      throw new Error('Navigation failed');
    });

    const MockErrorNavigation = () => {
      const router = useRouter();
      
      const handleNavigation = () => {
        try {
          router.push('/invalid-route');
        } catch (error) {
          console.error('Navigation error:', error);
        }
      };
      
      return (
        <Button title="Navigate with Error" onPress={handleNavigation} />
      );
    };

    const { getByText } = render(<MockErrorNavigation />);

    // Should not throw error when navigation fails
    expect(() => {
      const errorButton = getByText('Navigate with Error');
      fireEvent.press(errorButton);
    }).not.toThrow();

    expect(mockRouter.push).toHaveBeenCalledWith('/invalid-route');
  });

  it('maintains navigation state consistency', () => {
    let navigationHistory = [];
    
    mockRouter.push.mockImplementation((route) => {
      navigationHistory.push(route);
    });

    const MockNavigationHistory = () => {
      const router = useRouter();
      
      return (
        <View>
          <Button title="Home" onPress={() => router.push('/citizen')} />
          <Button title="Requests" onPress={() => router.push('/citizen/my-requests')} />
          <Button title="Profile" onPress={() => router.push('/citizen/profile')} />
        </View>
      );
    };

    const { getByText } = render(<MockNavigationHistory />);

    // Navigate through multiple screens
    fireEvent.press(getByText('Home'));
    fireEvent.press(getByText('Requests'));
    fireEvent.press(getByText('Profile'));

    expect(navigationHistory).toEqual([
      '/citizen',
      '/citizen/my-requests',
      '/citizen/profile'
    ]);
  });
});
