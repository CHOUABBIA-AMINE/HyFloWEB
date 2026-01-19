/**
 * Role DTO
 * Matches backend: dz.sh.trc.hyflo.system.security.dto.RoleDTO
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Aligned with backend: proper structure and typing
 * @created 12-22-2025
 */

import { PermissionDTO } from './PermissionDTO';

export interface RoleDTO {
  id?: number;
  name: string;
  description?: string;
  permissions?: PermissionDTO[];
}

export default RoleDTO;