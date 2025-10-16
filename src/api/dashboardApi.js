import client from './client';
import { ENDPOINTS } from '../constants/config';

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    try {
      const response = await client.get(ENDPOINTS.DASHBOARD);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch dashboard data',
      };
    }
  },
};

