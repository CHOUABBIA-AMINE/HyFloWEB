/**
 * Protected Route Component
 * 
 * Protects routes based on user permissions.
 * Redirects unauthorized users to a specified page.
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { usePermission } from '../hooks/usePermission';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  role?: string;
  anyRole?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  anyPermission,
  allPermissions,
  role,
  anyRole,
  redirectTo = '/unauthorized'
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isLoading } = usePermission();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
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

  return hasAccess ? <>{children}</> : <Navigate to={redirectTo} replace />;
};
