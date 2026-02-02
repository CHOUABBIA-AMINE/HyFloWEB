/**
 * Authentication and Authorization Types
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
 * @updated 02-02-2026 - Added firstName, lastName for convenience (derived from employee)
 */

import type { EmployeeDTO } from '@/modules/general/organization/dto/EmployeeDTO';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  accountNonLocked: boolean;
  
  // Employee details
  employee: EmployeeDTO | null;
  
  // Convenience fields (derived from employee.firstNameLt, employee.lastNameLt)
  // These can be set from the employee object or directly from the backend
  firstName?: string;
  lastName?: string;
  
  // Authorization
  roles: string[];
  permissions: string[];
  groups: string[];
  
  // Organizational structure
  organizationalStructureId: number | null;
  organizationalStructureCode: string | null;
  organizationalStructureName: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Helper function to get user's first name
 * Checks firstName field first, then falls back to employee.firstNameLt
 */
export const getUserFirstName = (user: UserProfile | null): string => {
  if (!user) return '';
  return user.firstName || user.employee?.firstNameLt || user.username;
};

/**
 * Helper function to get user's last name
 * Checks lastName field first, then falls back to employee.lastNameLt
 */
export const getUserLastName = (user: UserProfile | null): string => {
  if (!user) return '';
  return user.lastName || user.employee?.lastNameLt || '';
};

/**
 * Helper function to get user's full name
 * Returns "FirstName LastName" or username if names not available
 */
export const getUserFullName = (user: UserProfile | null): string => {
  if (!user) return '';
  
  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);
  
  if (lastName) {
    return `${firstName} ${lastName}`;
  }
  
  return firstName;
};
