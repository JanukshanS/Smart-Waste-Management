import { authApi } from '../../src/api/authApi';
import client from '../../src/api/client';

// Mock the API client
jest.mock('../../src/api/client');

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const mockUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'password123',
      address: {
        street: '123 Main St',
        city: 'Test City',
        postalCode: '12345',
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      }
    };

    it('handles successful signup', async () => {
      const mockResponse = {
        user: { id: '1', email: 'john@example.com' },
        token: 'mock-token'
      };

      client.post.mockResolvedValue(mockResponse);

      const result = await authApi.signup(mockUserData);

      expect(client.post).toHaveBeenCalledWith(
        expect.any(String), // ENDPOINTS.SIGNUP
        mockUserData
      );
      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
    });

    it('handles signup failure with error message', async () => {
      const mockError = {
        message: 'Email already exists',
        data: { message: 'User with this email already exists' }
      };

      client.post.mockRejectedValue(mockError);

      const result = await authApi.signup(mockUserData);

      expect(result).toEqual({
        success: false,
        error: 'Email already exists'
      });
    });

    it('handles signup failure with data message', async () => {
      const mockError = {
        data: { message: 'Invalid email format' }
      };

      client.post.mockRejectedValue(mockError);

      const result = await authApi.signup(mockUserData);

      expect(result).toEqual({
        success: false,
        error: 'Invalid email format'
      });
    });

    it('handles signup failure with default message', async () => {
      const mockError = {};

      client.post.mockRejectedValue(mockError);

      const result = await authApi.signup(mockUserData);

      expect(result).toEqual({
        success: false,
        error: 'Failed to sign up'
      });
    });

    it('handles network errors', async () => {
      client.post.mockRejectedValue(new Error('Network error'));

      const result = await authApi.signup(mockUserData);

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'password123'
    };

    it('handles successful login', async () => {
      const mockResponse = {
        user: { id: '1', email: 'john@example.com', role: 'citizen' },
        token: 'mock-token'
      };

      client.post.mockResolvedValue(mockResponse);

      const result = await authApi.login(mockCredentials);

      expect(client.post).toHaveBeenCalledWith(
        expect.any(String), // ENDPOINTS.LOGIN
        mockCredentials
      );
      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
    });

    it('handles login failure with error message', async () => {
      const mockError = {
        message: 'Invalid credentials',
        data: { message: 'Email or password is incorrect' }
      };

      client.post.mockRejectedValue(mockError);

      const result = await authApi.login(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('handles login failure with data message', async () => {
      const mockError = {
        data: { message: 'Account is suspended' }
      };

      client.post.mockRejectedValue(mockError);

      const result = await authApi.login(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Account is suspended'
      });
    });

    it('handles login failure with default message', async () => {
      const mockError = {};

      client.post.mockRejectedValue(mockError);

      const result = await authApi.login(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Failed to login'
      });
    });

    it('handles 401 unauthorized error', async () => {
      const mockError = {
        status: 401,
        message: 'Unauthorized',
        data: { message: 'Invalid email or password' }
      };

      client.post.mockRejectedValue(mockError);

      const result = await authApi.login(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized'
      });
    });

    it('handles server errors', async () => {
      const mockError = {
        status: 500,
        message: 'Internal server error'
      };

      client.post.mockRejectedValue(mockError);

      const result = await authApi.login(mockCredentials);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('API endpoint calls', () => {
    it('calls correct endpoints', async () => {
      client.post.mockResolvedValue({});

      await authApi.signup({});
      await authApi.login({});

      expect(client.post).toHaveBeenCalledTimes(2);
      // Verify endpoints are called (exact endpoint values depend on config)
      expect(client.post).toHaveBeenNthCalledWith(1, expect.any(String), {});
      expect(client.post).toHaveBeenNthCalledWith(2, expect.any(String), {});
    });
  });
});
