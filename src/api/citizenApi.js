import client from './client';

/**
 * Citizen API endpoints
 */

// Create waste collection request
export const createRequest = async (requestData) => {
  try {
    const response = await client.post('/citizen/requests', requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get user's requests
export const getMyRequests = async (params = {}) => {
  try {
    const { userId, status, page = 1, limit = 20 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (userId) {
      queryParams.append('userId', userId);
    }
    
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }
    
    const response = await client.get(`/citizen/requests?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get request by ID
export const getRequestById = async (requestId) => {
  try {
    const response = await client.get(`/citizen/requests/${requestId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Track request (with timeline)
export const trackRequest = async (requestId) => {
  try {
    const response = await client.get(`/citizen/requests/${requestId}/track`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Cancel request
export const cancelRequest = async (requestId) => {
  try {
    const response = await client.put(`/citizen/requests/${requestId}/cancel`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get nearby bins
export const getNearbyBins = async (params = {}) => {
  try {
    const { lat, lng, radius = 5000 } = params;
    
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required');
    }
    
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });
    
    const response = await client.get(`/citizen/bins/nearby?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  createRequest,
  getMyRequests,
  getRequestById,
  trackRequest,
  cancelRequest,
  getNearbyBins,
};

