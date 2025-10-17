import client from './client';

/**
 * Technician API
 * Handles all technician-related API calls
 */

/**
 * Get all work orders
 * @param {object} filters - Optional filters (status, priority, technicianId, page, limit)
 */
export const getWorkOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    if (filters.priority) {
      queryParams.append('priority', filters.priority);
    }
    if (filters.technicianId) {
      queryParams.append('technicianId', filters.technicianId);
    }
    if (filters.page) {
      queryParams.append('page', filters.page);
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit);
    }
    
    const endpoint = `/technician/work-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await client.get(endpoint);
    return response;
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get work order details by ID
 * @param {string} workOrderId - Work Order ID
 */
export const getWorkOrderDetails = async (workOrderId) => {
  try {
    const response = await client.get(`/technician/work-orders/${workOrderId}`);
    return response;
  } catch (error) {
    console.error('Error fetching work order details:', error);
    throw error;
  }
};

/**
 * Self-assign a work order
 * @param {string} workOrderId - Work Order ID
 * @param {string} technicianId - Technician ID
 */
export const assignWorkOrder = async (workOrderId, technicianId) => {
  try {
    const response = await client.put(`/technician/work-orders/${workOrderId}/assign`, {
      technicianId,
    });
    return response;
  } catch (error) {
    console.error('Error assigning work order:', error);
    throw error;
  }
};

/**
 * Start working on a work order
 * @param {string} workOrderId - Work Order ID
 */
export const startWorkOrder = async (workOrderId) => {
  try {
    const response = await client.put(`/technician/work-orders/${workOrderId}/start`);
    return response;
  } catch (error) {
    console.error('Error starting work order:', error);
    throw error;
  }
};

/**
 * Resolve a work order
 * @param {string} workOrderId - Work Order ID
 * @param {object} resolutionData - Resolution data (actionTaken, resolutionNotes, newDeviceId)
 */
export const resolveWorkOrder = async (workOrderId, resolutionData) => {
  try {
    const response = await client.put(`/technician/work-orders/${workOrderId}/resolve`, resolutionData);
    return response;
  } catch (error) {
    console.error('Error resolving work order:', error);
    throw error;
  }
};

/**
 * Escalate a work order
 * @param {string} workOrderId - Work Order ID
 * @param {string} reason - Escalation reason
 */
export const escalateWorkOrder = async (workOrderId, reason) => {
  try {
    const response = await client.put(`/technician/work-orders/${workOrderId}/escalate`, { reason });
    return response;
  } catch (error) {
    console.error('Error escalating work order:', error);
    throw error;
  }
};

/**
 * Register a new device
 * @param {object} deviceData - Device data (deviceId, deviceType, binId)
 */
export const registerDevice = async (deviceData) => {
  try {
    const response = await client.post('/technician/devices/register', deviceData);
    return response;
  } catch (error) {
    console.error('Error registering device:', error);
    throw error;
  }
};

/**
 * Get device details by ID
 * @param {string} deviceId - Device ID
 */
export const getDeviceDetails = async (deviceId) => {
  try {
    const response = await client.get(`/technician/devices/${deviceId}`);
    return response;
  } catch (error) {
    console.error('Error fetching device details:', error);
    throw error;
  }
};

/**
 * Update device status
 * @param {string} deviceId - Device ID
 * @param {string} status - New status (active, offline, decommissioned)
 */
export const updateDeviceStatus = async (deviceId, status) => {
  try {
    const response = await client.put(`/technician/devices/${deviceId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
};

