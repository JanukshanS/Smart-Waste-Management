import client from './client';

/**
 * Coordinator API
 * Handles all coordinator-related API calls
 */

/**
 * Get coordinator dashboard statistics
 */
export const getDashboard = async () => {
  try {
    const response = await client.get('/coordinator/dashboard');
    return response;
  } catch (error) {
    console.error('Error fetching coordinator dashboard:', error);
    throw error;
  }
};

/**
 * Get all bins with optional filters
 * @param {object} filters - Optional filters (fillLevel, status, sort)
 */
export const getBins = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.fillLevelGte) {
      queryParams.append('fillLevel[gte]', filters.fillLevelGte);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    }
    
    const endpoint = `/coordinator/bins${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching bins:', error);
    throw error;
  }
};

/**
 * Get pending waste requests
 */
export const getPendingRequests = async () => {
  try {
    const response = await client.get('/coordinator/requests/pending');
    return response;
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};

/**
 * Get all waste requests with optional filters
 * @param {object} filters - Optional filters (status, page, limit)
 */
export const getAllRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    // For now, use pending endpoint if no filter, or simulate with pending
    // In future, backend should provide /coordinator/requests endpoint
    const endpoint = filters.status === 'pending' || !filters.status 
      ? '/coordinator/requests/pending'
      : '/coordinator/requests/pending'; // TODO: Update backend to support all statuses
    
    const finalEndpoint = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get(finalEndpoint);
    return response;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

/**
 * Approve a waste request
 * @param {string} requestId - Request ID
 */
export const approveRequest = async (requestId) => {
  try {
    const response = await client.put(`/coordinator/requests/${requestId}/approve`);
    return response;
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
};

/**
 * Reject a waste request
 * @param {string} requestId - Request ID
 * @param {string} reason - Rejection reason
 */
export const rejectRequest = async (requestId, reason) => {
  try {
    const response = await client.put(`/coordinator/requests/${requestId}/reject`, { reason });
    return response;
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
};

/**
 * Generate optimized collection route
 * @param {object} options - Route optimization options
 */
export const optimizeRoute = async (options = {}) => {
  try {
    const data = {
      fillLevelThreshold: options.fillLevelThreshold || 90,
      includeApprovedRequests: options.includeApprovedRequests !== false,
      maxStops: options.maxStops || 50,
    };
    const response = await client.post('/coordinator/routes/optimize', data);
    return response;
  } catch (error) {
    console.error('Error optimizing route:', error);
    throw error;
  }
};

/**
 * Create a new collection route
 * @param {object} routeData - Route data
 */
export const createRoute = async (routeData) => {
  try {
    const response = await client.post('/coordinator/routes', routeData);
    return response;
  } catch (error) {
    console.error('Error creating route:', error);
    throw error;
  }
};

/**
 * Get all routes with optional filters
 * @param {object} filters - Optional filters (status, page, limit)
 */
export const getRoutes = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    const endpoint = `/coordinator/routes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

/**
 * Get route details by ID
 * @param {string} routeId - Route ID
 */
export const getRouteById = async (routeId) => {
  try {
    const response = await client.get(`/coordinator/routes/${routeId}`);
    return response;
  } catch (error) {
    console.error('Error fetching route details:', error);
    throw error;
  }
};

/**
 * Assign route to crew and vehicle
 * @param {string} routeId - Route ID
 * @param {object} assignment - Assignment data (crewId, vehicleId)
 */
export const assignRoute = async (routeId, assignment) => {
  try {
    const response = await client.put(`/coordinator/routes/${routeId}/assign`, assignment);
    return response;
  } catch (error) {
    console.error('Error assigning route:', error);
    throw error;
  }
};

/**
 * Update route status
 * @param {string} routeId - Route ID
 * @param {string} status - New status
 */
export const updateRouteStatus = async (routeId, status) => {
  try {
    const response = await client.put(`/coordinator/routes/${routeId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error updating route status:', error);
    throw error;
  }
};

/**
 * Update stop status in route
 * @param {string} routeId - Route ID
 * @param {number} stopIndex - Stop index
 * @param {object} stopData - Stop data (status, reason)
 */
export const updateStopStatus = async (routeId, stopIndex, stopData) => {
  try {
    const response = await client.put(`/coordinator/routes/${routeId}/stops/${stopIndex}`, stopData);
    return response;
  } catch (error) {
    console.error('Error updating stop status:', error);
    throw error;
  }
};
