import ApiClient from '../../src/api/client';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockResponse = { data: 'test' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles GET request with custom headers', async () => {
      const mockResponse = { data: 'test' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await ApiClient.get('/test', {
        headers: { 'Authorization': 'Bearer token' }
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer token',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request', async () => {
      const mockResponse = { success: true };
      const requestData = { name: 'test' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiClient.post('/test', requestData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('PUT requests', () => {
    it('makes successful PUT request', async () => {
      const mockResponse = { updated: true };
      const requestData = { id: 1, name: 'updated' };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiClient.put('/test/1', requestData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('makes successful DELETE request', async () => {
      const mockResponse = { deleted: true };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiClient.delete('/test/1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('handles HTTP error responses', async () => {
      const errorResponse = { message: 'Not found' };
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      await expect(ApiClient.get('/test')).rejects.toEqual({
        status: 404,
        message: 'Not found',
        data: errorResponse,
      });
    });

    it('handles HTTP error without message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(ApiClient.get('/test')).rejects.toEqual({
        status: 500,
        message: 'An error occurred',
        data: {},
      });
    });

    it('handles network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiClient.get('/test')).rejects.toThrow('Network error');
    });

    it('handles timeout errors', async () => {
      // Mock a timeout scenario by directly rejecting with AbortError
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      fetch.mockRejectedValueOnce(abortError);

      await expect(ApiClient.get('/test')).rejects.toEqual({
        status: 408,
        message: 'Request timeout',
      });
    });

    it('handles AbortError specifically', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      fetch.mockRejectedValueOnce(abortError);

      await expect(ApiClient.get('/test')).rejects.toEqual({
        status: 408,
        message: 'Request timeout',
      });
    });
  });

  describe('Request configuration', () => {
    it('includes abort signal in requests', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await ApiClient.get('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('merges custom options correctly', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await ApiClient.get('/test', {
        headers: { 'Custom-Header': 'value' },
        cache: 'no-cache',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          cache: 'no-cache',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Custom-Header': 'value',
          }),
        })
      );
    });
  });

  describe('Base URL handling', () => {
    it('constructs correct URLs', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await ApiClient.get('/users/123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/users\/123$/),
        expect.any(Object)
      );
    });
  });
});
