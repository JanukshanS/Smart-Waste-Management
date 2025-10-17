import client from './client';
import { ENDPOINTS } from '../constants/config';

/**
 * Auth API
 */
export const authApi = {
  /**
   * Sign up a new user
   * @param {object} userData - User registration data
   * Expected format:
   * {
   *   name: string,
   *   email: string,
   *   phone: string,
   *   password: string,
   *   address: {
   *     street: string,
   *     city: string,
   *     postalCode: string,
   *     coordinates: {
   *       lat: number,
   *       lng: number
   *     }
   *   }
   * }
   */
  signup: async (userData) => {
    try {
      const response = await client.post(ENDPOINTS.SIGNUP, userData);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.data?.message || 'Failed to sign up',
      };
    }
  },

  /**
   * Login user
   * @param {object} credentials - User login credentials
   * Expected format:
   * {
   *   email: string,
   *   password: string
   * }
   */
  login: async (credentials) => {
    try {
      const response = await client.post(ENDPOINTS.LOGIN, credentials);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.data?.message || 'Failed to login',
      };
    }
  },
};

