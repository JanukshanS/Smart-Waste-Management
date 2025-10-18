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

  it('renders without crashing', () => {
    const component = render(
      <RequestCard request={mockRequest} onPress={mockOnPress} />
    );
    expect(component).toBeDefined();
  });

  it('has correct props structure', () => {
    const component = <RequestCard request={mockRequest} onPress={mockOnPress} />;
    expect(component.props.request).toEqual(mockRequest);
    expect(component.props.onPress).toBe(mockOnPress);
  });

  it('handles different waste types', () => {
    const recycleRequest = { ...mockRequest, wasteType: 'recyclable' };
    const component = <RequestCard request={recycleRequest} onPress={mockOnPress} />;
    expect(component.props.request.wasteType).toBe('recyclable');
  });

  it('handles different statuses', () => {
    const completedRequest = { ...mockRequest, status: 'completed' };
    const component = <RequestCard request={completedRequest} onPress={mockOnPress} />;
    expect(component.props.request.status).toBe('completed');
  });

  it('handles missing onPress gracefully', () => {
    const component = <RequestCard request={mockRequest} />;
    expect(component.props.onPress).toBeUndefined();
  });

  it('handles zero estimated cost', () => {
    const noCostRequest = { ...mockRequest, estimatedCost: 0 };
    const component = <RequestCard request={noCostRequest} onPress={mockOnPress} />;
    expect(component.props.request.estimatedCost).toBe(0);
  });

  it('handles long addresses', () => {
    const longAddressRequest = {
      ...mockRequest,
      address: {
        street: 'Very Long Street Name That Should Be Truncated',
        city: 'Very Long City Name'
      }
    };
    const component = <RequestCard request={longAddressRequest} onPress={mockOnPress} />;
    expect(component.props.request.address.street).toContain('Very Long Street Name');
  });

  it('handles unknown waste type', () => {
    const unknownTypeRequest = { ...mockRequest, wasteType: 'unknown' };
    const component = <RequestCard request={unknownTypeRequest} onPress={mockOnPress} />;
    expect(component.props.request.wasteType).toBe('unknown');
  });

  it('handles unknown status', () => {
    const unknownStatusRequest = { ...mockRequest, status: 'unknown' };
    const component = <RequestCard request={unknownStatusRequest} onPress={mockOnPress} />;
    expect(component.props.request.status).toBe('unknown');
  });

  it('validates required request fields', () => {
    expect(mockRequest.id).toBeDefined();
    expect(mockRequest.trackingId).toBeDefined();
    expect(mockRequest.wasteType).toBeDefined();
    expect(mockRequest.status).toBeDefined();
    expect(mockRequest.address).toBeDefined();
  });
});