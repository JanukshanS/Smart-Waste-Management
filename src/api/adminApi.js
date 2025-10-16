import client from './client';

/**
 * Admin API endpoints
 */

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await client.get('/admin/dashboard');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all users with filters and pagination
export const getUsers = async (params = {}) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = params;
    
    // Build query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (role && role !== 'all') {
      queryParams.append('role', role);
    }
    
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }
    
    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }
    
    const response = await client.get(`/admin/users?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get single user by ID
// Note: Backend doesn't have a single user endpoint yet, so we fetch from list
export const getUserById = async (userId) => {
  try {
    // Try the direct endpoint first (in case it gets implemented)
    try {
      const response = await client.get(`/admin/users/${userId}`);
      return response;
    } catch (directError) {
      // If direct endpoint fails, fetch from list and find the user
      console.log('Direct endpoint not available, fetching from list...');
      const listResponse = await client.get('/admin/users?limit=1000');
      
      if (listResponse.success && listResponse.data) {
        const user = listResponse.data.find(u => u._id === userId);
        if (user) {
          return {
            success: true,
            data: user,
          };
        } else {
          return {
            success: false,
            message: 'User not found',
          };
        }
      }
      
      throw directError;
    }
  } catch (error) {
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await client.put(`/admin/users/${userId}`, userData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await client.delete(`/admin/users/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get collection reports
export const getCollectionReports = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    
    const response = await client.get(`/admin/reports/collections?${params.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get efficiency reports
export const getEfficiencyReports = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    
    const response = await client.get(`/admin/reports/efficiency?${params.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCollectionReports,
  getEfficiencyReports,
};
