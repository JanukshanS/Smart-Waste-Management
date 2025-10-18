import { 
  getRoleDashboardRoute, 
  getRoleDashboardTitle, 
  isValidRole 
} from '../../src/utils/navigation';

describe('Navigation Utils', () => {
  describe('getRoleDashboardRoute', () => {
    it('returns correct route for admin role', () => {
      expect(getRoleDashboardRoute('admin')).toBe('/admin');
      expect(getRoleDashboardRoute('ADMIN')).toBe('/admin');
    });

    it('returns correct route for citizen role', () => {
      expect(getRoleDashboardRoute('citizen')).toBe('/citizen');
      expect(getRoleDashboardRoute('CITIZEN')).toBe('/citizen');
    });

    it('returns correct route for coordinator role', () => {
      expect(getRoleDashboardRoute('coordinator')).toBe('/coordinator');
      expect(getRoleDashboardRoute('COORDINATOR')).toBe('/coordinator');
    });

    it('returns correct route for technician role', () => {
      expect(getRoleDashboardRoute('technician')).toBe('/technician');
      expect(getRoleDashboardRoute('TECHNICIAN')).toBe('/technician');
    });

    it('returns correct route for crew role', () => {
      expect(getRoleDashboardRoute('crew')).toBe('/crew');
      expect(getRoleDashboardRoute('CREW')).toBe('/crew');
    });

    it('returns default route for invalid role', () => {
      expect(getRoleDashboardRoute('invalid')).toBe('/citizen');
      expect(getRoleDashboardRoute('')).toBe('/citizen');
      expect(getRoleDashboardRoute(null)).toBe('/citizen');
      expect(getRoleDashboardRoute(undefined)).toBe('/citizen');
    });

    it('handles mixed case roles', () => {
      expect(getRoleDashboardRoute('Admin')).toBe('/admin');
      expect(getRoleDashboardRoute('CitiZen')).toBe('/citizen');
      expect(getRoleDashboardRoute('CoOrDiNaToR')).toBe('/coordinator');
    });
  });

  describe('getRoleDashboardTitle', () => {
    it('returns correct title for admin role', () => {
      expect(getRoleDashboardTitle('admin')).toBe('Admin Dashboard');
      expect(getRoleDashboardTitle('ADMIN')).toBe('Admin Dashboard');
    });

    it('returns correct title for citizen role', () => {
      expect(getRoleDashboardTitle('citizen')).toBe('Citizen Dashboard');
      expect(getRoleDashboardTitle('CITIZEN')).toBe('Citizen Dashboard');
    });

    it('returns correct title for coordinator role', () => {
      expect(getRoleDashboardTitle('coordinator')).toBe('Coordinator Dashboard');
      expect(getRoleDashboardTitle('COORDINATOR')).toBe('Coordinator Dashboard');
    });

    it('returns correct title for technician role', () => {
      expect(getRoleDashboardTitle('technician')).toBe('Technician Dashboard');
      expect(getRoleDashboardTitle('TECHNICIAN')).toBe('Technician Dashboard');
    });

    it('returns correct title for crew role', () => {
      expect(getRoleDashboardTitle('crew')).toBe('Crew Dashboard');
      expect(getRoleDashboardTitle('CREW')).toBe('Crew Dashboard');
    });

    it('returns default title for invalid role', () => {
      expect(getRoleDashboardTitle('invalid')).toBe('Citizen Dashboard');
      expect(getRoleDashboardTitle('')).toBe('Citizen Dashboard');
      expect(getRoleDashboardTitle(null)).toBe('Citizen Dashboard');
      expect(getRoleDashboardTitle(undefined)).toBe('Citizen Dashboard');
    });

    it('handles mixed case roles', () => {
      expect(getRoleDashboardTitle('Admin')).toBe('Admin Dashboard');
      expect(getRoleDashboardTitle('CitiZen')).toBe('Citizen Dashboard');
      expect(getRoleDashboardTitle('CoOrDiNaToR')).toBe('Coordinator Dashboard');
    });
  });

  describe('isValidRole', () => {
    it('returns true for valid roles', () => {
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('citizen')).toBe(true);
      expect(isValidRole('coordinator')).toBe(true);
      expect(isValidRole('technician')).toBe(true);
      expect(isValidRole('crew')).toBe(true);
    });

    it('returns true for valid roles in different cases', () => {
      expect(isValidRole('ADMIN')).toBe(true);
      expect(isValidRole('Admin')).toBe(true);
      expect(isValidRole('CITIZEN')).toBe(true);
      expect(isValidRole('CitiZen')).toBe(true);
      expect(isValidRole('COORDINATOR')).toBe(true);
      expect(isValidRole('CoOrDiNaToR')).toBe(true);
      expect(isValidRole('TECHNICIAN')).toBe(true);
      expect(isValidRole('Technician')).toBe(true);
      expect(isValidRole('CREW')).toBe(true);
      expect(isValidRole('Crew')).toBe(true);
    });

    it('returns false for invalid roles', () => {
      expect(isValidRole('invalid')).toBe(false);
      expect(isValidRole('user')).toBe(false);
      expect(isValidRole('manager')).toBe(false);
      expect(isValidRole('supervisor')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });

    it('returns false for null and undefined', () => {
      expect(isValidRole(null)).toBe(false);
      expect(isValidRole(undefined)).toBe(false);
    });

    it('returns false for non-string types', () => {
      expect(isValidRole(123)).toBe(false);
      expect(isValidRole({})).toBe(false);
      expect(isValidRole([])).toBe(false);
      expect(isValidRole(true)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles whitespace in roles', () => {
      expect(getRoleDashboardRoute(' admin ')).toBe('/citizen'); // Should trim or handle gracefully
      expect(getRoleDashboardTitle(' citizen ')).toBe('Citizen Dashboard');
      expect(isValidRole(' coordinator ')).toBe(false);
    });

    it('handles special characters', () => {
      expect(getRoleDashboardRoute('admin!')).toBe('/citizen');
      expect(getRoleDashboardTitle('citizen@')).toBe('Citizen Dashboard');
      expect(isValidRole('coordinator#')).toBe(false);
    });
  });
});
