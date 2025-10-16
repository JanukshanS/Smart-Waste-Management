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

// Get all users (placeholder for future)
export const getUsers = async () => {
  try {
    const response = await client.get('/admin/users');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get system health (placeholder for future)
export const getSystemHealth = async () => {
  try {
    const response = await client.get('/admin/health');
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardStats,
  getUsers,
  getSystemHealth,
};
