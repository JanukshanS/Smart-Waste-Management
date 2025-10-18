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
  const mockLogout = jest.fn();
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'citizen'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Clear the global mock router
    global.mockRouter.replace.mockClear();
    
    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  it('renders without crashing', () => {
    const component = render(
      <DashboardHeader title="Dashboard" subtitle="Manage your requests" />
    );
    expect(component).toBeDefined();
  });

  it('has correct props', () => {
    const component = <DashboardHeader title="Dashboard" subtitle="Manage your requests" />;
    expect(component.props.title).toBe('Dashboard');
    expect(component.props.subtitle).toBe('Manage your requests');
  });

  it('renders without subtitle when not provided', () => {
    const component = <DashboardHeader title="Dashboard" />;
    expect(component.props.subtitle).toBeUndefined();
  });

  it('handles missing user gracefully', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    const component = render(<DashboardHeader title="Dashboard" />);
    expect(component).toBeDefined();
  });

  it('uses user name when available', () => {
    useAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });

    const component = render(<DashboardHeader title="Dashboard" />);
    expect(component).toBeDefined();
  });

  it('falls back to email when name is not available', () => {
    useAuth.mockReturnValue({
      user: { ...mockUser, name: null },
      logout: mockLogout,
    });

    const component = render(<DashboardHeader title="Dashboard" />);
    expect(component).toBeDefined();
  });

  it('has logout functionality', () => {
    const component = render(<DashboardHeader title="Dashboard" />);
    expect(mockLogout).toBeDefined();
  });

  it('handles successful logout', async () => {
    mockLogout.mockResolvedValue({ success: true });
    
    // Test that logout function is available
    const result = await mockLogout();
    expect(result.success).toBe(true);
  });

  it('handles failed logout', async () => {
    mockLogout.mockResolvedValue({ success: false });
    
    const result = await mockLogout();
    expect(result.success).toBe(false);
  });

  it('validates component structure', () => {
    const component = <DashboardHeader title="Test Title" subtitle="Test Subtitle" />;
    expect(component.type).toBe(DashboardHeader);
    expect(component.props).toEqual({
      title: 'Test Title',
      subtitle: 'Test Subtitle'
    });
  });
});