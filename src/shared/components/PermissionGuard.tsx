/**
 * Permission Guard Component
 * 
 * Conditionally renders children based on user permissions.
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import React from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionGuardProps {
  children: React.ReactNode;
  
  // Permission checks
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  
  // Role checks
  role?: string;
  anyRole?: string[];
  
  // Fallback content if no permission
  fallback?: React.ReactNode;
  
  // Show loading state while checking permissions
  showLoading?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  fallback = null,
  showLoading = false
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading } = usePermission();

  if (isLoading && showLoading) {
    return null; // or a loading spinner
  }

  if (isLoading && !showLoading) {
    return null;
  }

  let hasAccess = true;

  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(...anyPermission)) {
    hasAccess = false;
  }

  if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(...allPermissions)) {
    hasAccess = false;
  }

  if (role && !hasRole(role)) {
    hasAccess = false;
  }

  if (anyRole && anyRole.length > 0 && !hasAnyRole(...anyRole)) {
    hasAccess = false;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
