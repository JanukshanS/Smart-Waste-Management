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

/**
 * CREW MANAGEMENT
 */

/**
 * Get all crew members
 * @param {object} filters - Optional filters (status, page, limit, sort)
 */
export const getCrews = async (filters = {}) => {
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
    if (filters.sort) {
      queryParams.append('sort', filters.sort);
    }
    
    const endpoint = `/coordinator/crews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching crews:', error);
    throw error;
  }
};

/**
 * Create a new crew member
 * @param {object} crewData - Crew data (name, email, phone, password, vehicleId, address)
 */
export const createCrew = async (crewData) => {
  try {
    const response = await client.post('/coordinator/crews', crewData);
    return response;
  } catch (error) {
    console.error('Error creating crew:', error);
    throw error;
  }
};

/**
 * Get crew details by ID
 * @param {string} crewId - Crew ID
 */
export const getCrewDetails = async (crewId) => {
  try {
    const response = await client.get(`/coordinator/crews/${crewId}`);
    return response;
  } catch (error) {
    console.error('Error fetching crew details:', error);
    throw error;
  }
};

/**
 * Update crew availability
 * @param {string} crewId - Crew ID
 * @param {string} availability - New availability status (available, assigned, unavailable, on-leave)
 */
export const updateCrewAvailability = async (crewId, availability) => {
  try {
    const response = await client.put(`/coordinator/crews/${crewId}/availability`, { availability });
    return response;
  } catch (error) {
    console.error('Error updating crew availability:', error);
    throw error;
  }
};

// ==================== Vehicle Management ====================

/**
 * Get all vehicles with filtering and pagination
 * @param {Object} params - Query parameters (status, vehicleType, page, limit, sort)
 */
export const getVehicles = async (params = {}) => {
  try {
    const response = await client.get('/coordinator/vehicles', { params });
    return response;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

/**
 * Get available vehicles for route assignment
 */
export const getAvailableVehicles = async () => {
  try {
    const response = await client.get('/coordinator/vehicles/available');
    return response;
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    throw error;
  }
};

/**
 * Get vehicle details by ID
 * @param {string} vehicleId - Vehicle ID
 */
export const getVehicleDetails = async (vehicleId) => {
  try {
    const response = await client.get(`/coordinator/vehicles/${vehicleId}`);
    return response;
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    throw error;
  }
};

/**
 * Create new vehicle
 * @param {Object} vehicleData - Vehicle data
 */
export const createVehicle = async (vehicleData) => {
  try {
    const response = await client.post('/coordinator/vehicles', vehicleData);
    return response;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

/**
 * Update vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} vehicleData - Updated vehicle data
 */
export const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    const response = await client.put(`/coordinator/vehicles/${vehicleId}`, vehicleData);
    return response;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

/**
 * Delete vehicle
 * @param {string} vehicleId - Vehicle ID
 */
export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await client.delete(`/coordinator/vehicles/${vehicleId}`);
    return response;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

/**
 * Update vehicle status
 * @param {string} vehicleId - Vehicle ID
 * @param {string} status - New status (available, in-use, maintenance, decommissioned)
 */
export const updateVehicleStatus = async (vehicleId, status) => {
  try {
    const response = await client.put(`/coordinator/vehicles/${vehicleId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    throw error;
  }
};

/**
 * Add maintenance record to vehicle
 * @param {string} vehicleId - Vehicle ID
 * @param {Object} maintenanceData - Maintenance record data
 */
export const addVehicleMaintenanceRecord = async (vehicleId, maintenanceData) => {
  try {
    const response = await client.post(`/coordinator/vehicles/${vehicleId}/maintenance`, maintenanceData);
    return response;
  } catch (error) {
    console.error('Error adding maintenance record:', error);
    throw error;
  }
};
