/**
 * Navigation utilities for role-based routing
 */

/**
 * Get the dashboard route based on user role
 * @param {string} role - User role (admin, citizen, coordinator, technician, crew)
 * @returns {string} - Route path for the role's dashboard
 */
export const getRoleDashboardRoute = (role) => {
  const roleRoutes = {
    admin: "/admin",
    citizen: "/citizen",
    coordinator: "/coordinator",
    technician: "/technician",
    crew: "/crew",
  };

  return roleRoutes[role?.toLowerCase()] || '/citizen';
};

/**
 * Get the dashboard title based on user role
 * @param {string} role - User role
 * @returns {string} - Dashboard title
 */
export const getRoleDashboardTitle = (role) => {
  const roleTitles = {
    admin: "Admin Dashboard",
    citizen: "Citizen Dashboard",
    coordinator: "Coordinator Dashboard",
    technician: "Technician Dashboard",
    crew: "Crew Dashboard",
  };

  return roleTitles[role?.toLowerCase()] || 'Citizen Dashboard';
};

/**
 * Check if a role is valid
 * @param {string} role - User role to validate
 * @returns {boolean} - Whether the role is valid
 */
export const isValidRole = (role) => {
  const validRoles = ["admin", "citizen", "coordinator", "technician", "crew"];
  return validRoles.includes(role?.toLowerCase());
};