import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DashboardHeader from '../../src/components/DashboardHeader';
import { useAuth } from '../../src/contexts/AuthContext';

// Mock the AuthContext
jest.mock('../../src/contexts/AuthContext');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('DashboardHeader Component', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  const mockLogout = jest.fn();
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'citizen'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
    
    // Mock expo-router
    require('expo-router').useRouter.mockReturnValue(mockRouter);
  });

  it('renders title and subtitle correctly', () => {
    const { getByText } = render(
      <DashboardHeader title="Dashboard" subtitle="Manage your requests" />
    );

    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Manage your requests')).toBeTruthy();
  });

  it('renders welcome message and user name', () => {
    const { getByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    expect(getByText('Welcome back!')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders user email when name is not available', () => {
    useAuth.mockReturnValue({
      user: { ...mockUser, name: null },
      logout: mockLogout,
    });

    const { getByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    expect(getByText('john@example.com')).toBeTruthy();
  });

  it('renders without subtitle when not provided', () => {
    const { queryByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    expect(queryByText('Manage your requests')).toBeNull();
  });

  it('shows logout confirmation dialog when logout button is pressed', () => {
    const { getByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    fireEvent.press(getByText('Logout'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
        expect.objectContaining({ text: 'Logout', style: 'destructive' })
      ])
    );
  });

  it('calls logout and navigates on successful logout', async () => {
    mockLogout.mockResolvedValue({ success: true });

    const { getByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    fireEvent.press(getByText('Logout'));

    // Simulate pressing the logout button in the alert
    const alertCall = Alert.alert.mock.calls[0];
    const logoutAction = alertCall[2][1]; // Second button (Logout)
    await logoutAction.onPress();

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith('/auth-landing');
    });
  });

  it('shows error alert on failed logout', async () => {
    mockLogout.mockResolvedValue({ success: false });

    const { getByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    fireEvent.press(getByText('Logout'));

    // Simulate pressing the logout button in the alert
    const alertCall = Alert.alert.mock.calls[0];
    const logoutAction = alertCall[2][1]; // Second button (Logout)
    await logoutAction.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to logout. Please try again.'
      );
    });
  });

  it('handles missing user gracefully', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    const { getByText, queryByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    expect(getByText('Welcome back!')).toBeTruthy();
    expect(queryByText('John Doe')).toBeNull();
  });

  it('has correct accessibility properties', () => {
    const { getByText } = render(
      <DashboardHeader title="Dashboard" />
    );

    const logoutButton = getByText('Logout').parent;
    expect(logoutButton.props.accessible).toBeTruthy();
  });
});
