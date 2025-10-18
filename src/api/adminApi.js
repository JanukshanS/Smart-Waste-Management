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

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await client.post('/admin/users', userData);
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

/**
 * PRIVACY SETTINGS
 */

// Get privacy settings
export const getPrivacySettings = async () => {
  try {
    const response = await client.get('/admin/privacy-settings');
    return response;
  } catch (error) {
    throw error;
  }
};

// Update privacy settings
export const updatePrivacySettings = async (settings, adminId) => {
  try {
    const response = await client.put(`/admin/privacy-settings?adminId=${adminId}`, settings);
    return response;
  } catch (error) {
    throw error;
  }
};

// Export privacy report
export const exportPrivacyReport = async () => {
  try {
    const response = await client.get('/admin/privacy-settings/export');
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * SECURITY MONITORING
 */

// Get security logs
export const getSecurityLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.eventType) {
      queryParams.append('eventType', filters.eventType);
    }
    if (filters.severity) {
      queryParams.append('severity', filters.severity);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    const endpoint = `/admin/security/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get(endpoint);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get active sessions
export const getActiveSessions = async () => {
  try {
    const response = await client.get('/admin/security/sessions');
    return response;
  } catch (error) {
    throw error;
  }
};

// Force logout user
export const forceLogout = async (userId, adminId) => {
  try {
    const response = await client.post(`/admin/security/force-logout/${userId}?adminId=${adminId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update security policies
export const updateSecurityPolicies = async (policies, adminId) => {
  try {
    const response = await client.put(`/admin/security/policies?adminId=${adminId}`, policies);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * BILLING CONFIGURATION
 */

// Get billing configuration
export const getBillingConfig = async () => {
  try {
    const response = await client.get('/admin/billing/config');
    return response;
  } catch (error) {
    throw error;
  }
};

// Update billing configuration
export const updateBillingConfig = async (config, adminId) => {
  try {
    const response = await client.put(`/admin/billing/config?adminId=${adminId}`, config);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get payment reports
export const getPaymentReports = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = `/admin/reports/payments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await client.get(endpoint);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * BIN MANAGEMENT
 */

// Get all bins with pagination
export const getBins = async (params = {}) => {
  try {
    const { page = 1, limit = 10 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await client.get(`/bins?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all devices with pagination
export const getDevices = async (params = {}) => {
  try {
    const { page = 1, limit = 100 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await client.get(`/devices?${queryParams.toString()}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get single bin by ID (using MongoDB _id)
export const getBinById = async (binId) => {
  try {
    const response = await client.get(`/bins/${binId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create new bin
export const createBin = async (binData) => {
  try {
    const response = await client.post('/bins', binData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update bin
export const updateBin = async (binId, binData) => {
  try {
    const response = await client.put(`/bins/${binId}`, binData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete bin
export const deleteBin = async (binId) => {
  try {
    const response = await client.delete(`/bins/${binId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCollectionReports,
  getEfficiencyReports,
  // Privacy
  getPrivacySettings,
  updatePrivacySettings,
  exportPrivacyReport,
  // Security
  getSecurityLogs,
  getActiveSessions,
  forceLogout,
  updateSecurityPolicies,
  // Billing
  getBillingConfig,
  updateBillingConfig,
  getPaymentReports,
  // Bins
  getBins,
  getBinById,
  createBin,
  updateBin,
  deleteBin,
  // Devices
  getDevices,
};
