import client from './client';

/**
 * Crew API
 * Handles all crew-related API calls
 */

/**
 * Get crew dashboard with assigned routes and tasks
 * @param {string} crewId - Crew member ID
 */
export const getDashboard = async (crewId) => {
  try {
    const response = await client.get(`/coordinator/crews/${crewId}`);
    return response;
  } catch (error) {
    console.error('Error fetching crew dashboard:', error);
    throw error;
  }
};

/**
 * Get crew's active route
 * @param {string} crewId - Crew member ID
 */
export const getActiveRoute = async (crewId) => {
  try {
    // Get crew details which includes current route
    const response = await client.get(`/coordinator/crews/${crewId}`);
    if (response.success && response.data?.currentRoute) {
      return {
        success: true,
        data: response.data.currentRoute
      };
    }
    return {
      success: true,
      data: null
    };
  } catch (error) {
    console.error('Error fetching active route:', error);
    throw error;
  }
};

/**
 * Get all routes assigned to crew member
 * @param {string} crewId - Crew member ID
 * @param {object} filters - Optional filters (status, page, limit)
 */
export const getMyRoutes = async (crewId, filters = {}) => {
  try {
    // First try the dedicated crew routes endpoint
    const queryParams = new URLSearchParams({ crewId });
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    const endpoint = `/crew/routes?${queryParams.toString()}`;
    
    try {
      const response = await client.get(endpoint);
      return response;
    } catch (routesError) {
      // If crew routes endpoint fails, try to get routes from crew details
      console.log('Crew routes endpoint failed, trying crew details...');
      const crewResponse = await client.get(`/coordinator/crews/${crewId}`);
      
      if (crewResponse.success && crewResponse.data) {
        const { currentRoute, routeHistory } = crewResponse.data;
        const routes = [];
        
        if (currentRoute) {
          routes.push(currentRoute);
        }
        
        if (routeHistory && Array.isArray(routeHistory)) {
          routes.push(...routeHistory);
        }
        
        // Apply filters if needed
        let filteredRoutes = routes;
        if (filters.status && filters.status !== 'all') {
          filteredRoutes = routes.filter(route => route.status === filters.status);
        }
        
        return {
          success: true,
          data: filteredRoutes
        };
      }
      
      throw routesError;
    }
  } catch (error) {
    console.error('Error fetching crew routes:', error);
    throw error;
  }
};

/**
 * Get route details by ID
 * @param {string} routeId - Route ID
 */
export const getRouteDetails = async (routeId) => {
  try {
    const response = await client.get(`/crew/routes/${routeId}`);
    return response;
  } catch (error) {
    console.error('Error fetching route details:', error);
    throw error;
  }
};

/**
 * Update stop status in assigned route
 * @param {string} routeId - Route ID
 * @param {number} stopIndex - Index of the stop
 * @param {object} stopData - Stop data (status, notes)
 */
export const updateStopStatus = async (routeId, stopIndex, stopData) => {
  try {
    const response = await client.put(
      `/crew/routes/${routeId}/stops/${stopIndex}/status`,
      stopData
    );
    return response;
  } catch (error) {
    console.error('Error updating stop status:', error);
    throw error;
  }
};

/**
 * Report an issue during collection
 * @param {object} issueData - Issue data (description, location, type, etc.)
 */
export const reportIssue = async (issueData) => {
  try {
    const response = await client.post('/crew/issues', issueData);
    return response;
  } catch (error) {
    console.error('Error reporting issue:', error);
    throw error;
  }
};

/**
 * Get crew member profile
 * @param {string} crewId - Crew member ID
 */
export const getProfile = async (crewId) => {
  try {
    // Get crew details which includes profile information
    const response = await client.get(`/coordinator/crews/${crewId}`);
    if (response.success && response.data) {
      const { crew, profile } = response.data;
      return {
        success: true,
        data: {
          ...crew,
          profile: profile
        }
      };
    }
    return response;
  } catch (error) {
    console.error('Error fetching crew profile:', error);
    throw error;
  }
};

/**
 * Update crew availability status
 * @param {string} crewId - Crew member ID
 * @param {string} availability - New availability status (available, unavailable, on-leave)
 */
export const updateAvailability = async (crewId, availability) => {
  try {
    const response = await client.put(`/crew/profile/${crewId}/availability`, {
      availability,
    });
    return response;
  } catch (error) {
    console.error('Error updating crew availability:', error);
    throw error;
  }
};

