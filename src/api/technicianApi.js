import client from './client';
import { TECHNICIAN_ID } from '../constants/devConfig';

/**
 * Technician API
 * Handles all technician-related API calls
 */

// Technician ID is imported from devConfig.js
// To change the ID, update it in src/constants/devConfig.js

/**
 * Get work orders for the technician
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, in-progress, completed, escalated)
 * @param {string} params.priority - Filter by priority (low, medium, high)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const getWorkOrders = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status && params.status !== 'all') {
    queryParams.append('status', params.status);
  }
  if (params.priority && params.priority !== 'all') {
    queryParams.append('priority', params.priority);
  }
  if (params.page) {
    queryParams.append('page', params.page);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit);
  }

  const queryString = queryParams.toString();
  const endpoint = `/technician/work-orders${queryString ? `?${queryString}` : ''}`;
  
  return client.get(endpoint);
};

/**
 * Get work order details by ID
 * @param {string} workOrderId - Work order ID
 */
export const getWorkOrderDetails = async (workOrderId) => {
  return client.get(`/technician/work-orders/${workOrderId}`);
};

/**
 * Update work order status
 * @param {string} workOrderId - Work order ID
 * @param {Object} data - Update data
 */
export const updateWorkOrder = async (workOrderId, data) => {
  return client.put(`/technician/work-orders/${workOrderId}`, data);
};

/**
 * Assign work order to technician
 * @param {string} workOrderId - Work order ID
 * @param {string} technicianId - Technician ID (optional, uses default if not provided)
 */
export const assignWorkOrder = async (workOrderId, technicianId = TECHNICIAN_ID) => {
  return client.put(`/technician/work-orders/${workOrderId}/assign`, {
    technicianId,
  });
};

/**
 * Start work on a work order
 * @param {string} workOrderId - Work order ID
 */
export const startWorkOrder = async (workOrderId) => {
  return client.put(`/technician/work-orders/${workOrderId}/start`);
};

/**
 * Resolve/complete a work order
 * @param {string} workOrderId - Work order ID
 * @param {Object} resolutionData - Resolution details
 * @param {string} resolutionData.actionTaken - Action taken (e.g., "repaired")
 * @param {string} resolutionData.resolutionNotes - Resolution notes
 * @param {string} resolutionData.newDeviceId - New device ID (optional)
 */
export const resolveWorkOrder = async (workOrderId, resolutionData) => {
  return client.put(`/technician/work-orders/${workOrderId}/resolve`, resolutionData);
};

/**
 * Get all bins
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const getBins = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) {
    queryParams.append('page', params.page);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit);
  }

  const queryString = queryParams.toString();
  const endpoint = `/bins${queryString ? `?${queryString}` : ''}`;
  
  return client.get(endpoint);
};

/**
 * Get all devices
 * @param {Object} params - Query parameters
 * @param {string} params.binId - Filter by bin ID
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const getDevices = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.binId) {
    queryParams.append('binId', params.binId);
  }
  if (params.page) {
    queryParams.append('page', params.page);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit);
  }

  const queryString = queryParams.toString();
  const endpoint = `/devices${queryString ? `?${queryString}` : ''}`;
  
  return client.get(endpoint);
};

