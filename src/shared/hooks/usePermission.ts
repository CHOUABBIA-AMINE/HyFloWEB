/**
 * usePermission Hook
 * 
 * React hook to check user permissions in components.
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import { useState, useEffect } from 'react';
import { AuthorizationService } from '@/services/AuthorizationService';
import type { UserProfile } from '@/types/auth';

export interface UsePermissionResult {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasAllPermissions: (...permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (...roles: string[]) => boolean;
  can: (permission: string, fallbackRole?: string) => boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

export const usePermission = (): UsePermissionResult => {
  const [user, setUser] = useState<UserProfile | null>(AuthorizationService.getUser());
  const [isLoading, setIsLoading] = useState(!user);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = AuthorizationService.getUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoading(false);
      } else {
        // Try to load from storage
        try {
          await AuthorizationService.initialize();
          setUser(AuthorizationService.getUser());
        } catch (error) {
          console.error('Failed to load user permissions:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUser();
  }, []);

  return {
    hasPermission: (permission: string) => AuthorizationService.hasPermission(permission),
    hasAnyPermission: (...permissions: string[]) => AuthorizationService.hasAnyPermission(...permissions),
    hasAllPermissions: (...permissions: string[]) => AuthorizationService.hasAllPermissions(...permissions),
    hasRole: (role: string) => AuthorizationService.hasRole(role),
    hasAnyRole: (...roles: string[]) => AuthorizationService.hasAnyRole(...roles),
    can: (permission: string, fallbackRole?: string) => AuthorizationService.can(permission, fallbackRole),
    user,
    isLoading
  };
};
