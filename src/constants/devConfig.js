/**
 * Development Configuration
 * ⚠️ TEMPORARY - Replace with actual Auth Context after login implementation
 * 
 * This file contains hardcoded user IDs for development and testing.
 * To change the active user, simply update the ID here.
 */

// ===========================================
// 🔧 CHANGE THESE IDs FOR TESTING
// ===========================================

export const DEV_USER_IDS = {
  // Technician ID for work order operations
  TECHNICIAN_ID: '68f17571b188a4a7463c1c27',
  
  // Citizen ID for waste collection requests (used in MyRequestsScreen)
  CITIZEN_ID: '68f17571b188a4a7463c1c27',
  
  // Add more user IDs as needed for different roles
  // ADMIN_ID: 'xxx',
  // COORDINATOR_ID: 'xxx',
};

// Export individual IDs for convenience
export const { TECHNICIAN_ID, CITIZEN_ID } = DEV_USER_IDS;

// Export all IDs as default
export default DEV_USER_IDS;

