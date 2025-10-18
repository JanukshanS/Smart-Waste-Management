import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Client for making HTTP requests
 */
class ApiClient {
  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Get authentication headers
   */
  async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        return {
          'Authorization': `Bearer ${token}`,
        };
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return {};
  }

  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const authHeaders = await this.getAuthHeaders();
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'An error occurred',
          data,
        };
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw {
          status: 408,
          message: 'Request timeout',
        };
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export default new ApiClient();

