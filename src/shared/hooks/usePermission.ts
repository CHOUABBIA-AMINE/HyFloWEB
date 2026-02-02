/**
 * Permission Hook
 * React hook for checking user permissions and roles in components
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 * @updated 02-02-2026 - Sync with AuthContext for reactive updates
 */

import { useAuth } from '@/shared/context/AuthContext';
import { AuthorizationService } from '@/services/AuthorizationService';

/**
 * Custom hook for permission-based authorization in React components
 * 
 * @example
 * ```tsx
 * const { hasPermission, hasRole } = usePermission();
 * 
 * if (hasPermission('READING:VALIDATE')) {
 *   return <ValidateButton />;
 * }
 * ```
 */
export const usePermission = () => {
  const { user, isLoading } = useAuth();

  /**
   * Check if current user has a specific permission
   * @param permission - Permission string (e.g., 'READING:VALIDATE')
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  /**
   * Check if current user has ANY of the specified permissions
   * @param permissions - Array of permission strings
   */
  const hasAnyPermission = (...permissions: string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissions.some(permission => user.permissions.includes(permission));
  };

  /**
   * Check if current user has ALL of the specified permissions
   * @param permissions - Array of permission strings
   */
  const hasAllPermissions = (...permissions: string[]): boolean => {
    if (!user || !user.permissions) {
      return false;
    }
    return permissions.every(permission => user.permissions.includes(permission));
  };

  /**
   * Check if current user has a specific role
   * @param role - Role string (e.g., 'ROLE_ADMIN', 'ROLE_VALIDATOR')
   */
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  };

  /**
   * Check if current user has ANY of the specified roles
   * @param roles - Array of role strings
   */
  const hasAnyRole = (...roles: string[]): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    return roles.some(role => user.roles.includes(role));
  };

  /**
   * Check if current user has ALL of the specified roles
   * @param roles - Array of role strings
   */
  const hasAllRoles = (...roles: string[]): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    return roles.every(role => user.roles.includes(role));
  };

  return {
    user,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};
