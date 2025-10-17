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
    const queryString = new URLSearchParams(params).toString();
    const response = await client.get(`/citizen/requests?${queryString}`);
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

// Cancel request
export const cancelRequest = async (requestId) => {
  try {
    const response = await client.delete(`/citizen/requests/${requestId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  createRequest,
  getMyRequests,
  getRequestById,
  cancelRequest,
};

