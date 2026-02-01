/**
 * Authentication and Authorization Types
 * 
 * @author CHOUABBIA Amine
 * @created 02-01-2026
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
