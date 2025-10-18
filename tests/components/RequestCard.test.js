import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RequestCard from '../../src/components/Citizen/RequestCard';

describe('RequestCard Component', () => {
  const mockRequest = {
    id: '1',
    trackingId: 'WM001',
    wasteType: 'household',
    status: 'pending',
    quantity: '5 bags',
    address: {
      street: '123 Main St',
      city: 'Test City'
    },
    preferredDate: '2024-01-15T00:00:00Z',
    estimatedCost: 150.50,
    createdAt: '2024-01-10T00:00:00Z'
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders request information correctly', () => {
    const { getByText } = render(
      <RequestCard request={mockRequest} onPress={mockOnPress} />
    );

    expect(getByText('household')).toBeTruthy();
    expect(getByText('#WM001')).toBeTruthy();
    expect(getByText('5 bags')).toBeTruthy();
    expect(getByText('123 Main St, Test City')).toBeTruthy();
    expect(getByText('Rs. 150.50')).toBeTruthy();
  });

  it('displays correct status badge', () => {
    const { getByText } = render(
      <RequestCard request={mockRequest} onPress={mockOnPress} />
    );

    expect(getByText('Pending')).toBeTruthy();
  });

  it('handles different waste types', () => {
    const recycleRequest = { ...mockRequest, wasteType: 'recyclable' };
    const { getByText } = render(
      <RequestCard request={recycleRequest} onPress={mockOnPress} />
    );

    expect(getByText('recyclable')).toBeTruthy();
  });

  it('handles different statuses', () => {
    const completedRequest = { ...mockRequest, status: 'completed' };
    const { getByText } = render(
      <RequestCard request={completedRequest} onPress={mockOnPress} />
    );

    expect(getByText('Completed')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const { getByText } = render(
      <RequestCard request={mockRequest} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('household'));
    expect(mockOnPress).toHaveBeenCalledWith(mockRequest);
  });

  it('formats dates correctly', () => {
    const { getByText } = render(
      <RequestCard request={mockRequest} onPress={mockOnPress} />
    );

    expect(getByText('Jan 15, 2024')).toBeTruthy();
    expect(getByText('Created: Jan 10, 2024')).toBeTruthy();
  });

  it('hides estimated cost when zero', () => {
    const noCostRequest = { ...mockRequest, estimatedCost: 0 };
    const { queryByText } = render(
      <RequestCard request={noCostRequest} onPress={mockOnPress} />
    );

    expect(queryByText(/Estimated Cost/)).toBeNull();
  });

  it('handles missing onPress gracefully', () => {
    const { getByText } = render(
      <RequestCard request={mockRequest} />
    );

    expect(() => fireEvent.press(getByText('household'))).not.toThrow();
  });

  it('truncates long addresses', () => {
    const longAddressRequest = {
      ...mockRequest,
      address: {
        street: 'Very Long Street Name That Should Be Truncated',
        city: 'Very Long City Name'
      }
    };

    const { getByText } = render(
      <RequestCard request={longAddressRequest} onPress={mockOnPress} />
    );

    const addressText = getByText(/Very Long Street Name/);
    expect(addressText.props.numberOfLines).toBe(1);
  });

  it('handles unknown waste type gracefully', () => {
    const unknownTypeRequest = { ...mockRequest, wasteType: 'unknown' };
    const { getByText } = render(
      <RequestCard request={unknownTypeRequest} onPress={mockOnPress} />
    );

    expect(getByText('unknown')).toBeTruthy();
  });

  it('handles unknown status gracefully', () => {
    const unknownStatusRequest = { ...mockRequest, status: 'unknown' };
    const { getByText } = render(
      <RequestCard request={unknownStatusRequest} onPress={mockOnPress} />
    );

    // Should default to pending status
    expect(getByText('Pending')).toBeTruthy();
  });
});
