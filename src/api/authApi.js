import client from './client';
import { ENDPOINTS } from '../constants/config';

/**
 * Auth API
 */
export const authApi = {
  /**
   * Sign up a new user
   * @param {object} userData - User registration data
   */
  signup: async (userData) => {
    try {
      const response = await client.post(ENDPOINTS.SIGNUP, userData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to sign up',
      };
    }
  },
};

