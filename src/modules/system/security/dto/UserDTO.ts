/**
 * User DTO
 * Matches backend: dz.mdn.iaas.system.security.dto.UserDTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 01-20-2026
 */

import { EmployeeDTO } from '../../organization/dto/EmployeeDTO';
import { RoleDTO } from './RoleDTO';
import { GroupDTO } from './GroupDTO';

export interface UserDTO {
  id?: number;
  username: string;
  email: string;
  password?: string; // Write-only, not returned from backend
  enabled?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  
  // Employee relationship
  employeeId?: number;
  employee?: EmployeeDTO;
  
  // Roles and groups (Sets in backend)
  roles?: RoleDTO[];
  groups?: GroupDTO[];
}

export default UserDTO;
