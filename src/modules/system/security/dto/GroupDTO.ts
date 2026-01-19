/**
 * Group DTO
 * Matches backend: dz.sh.trc.hyflo.system.security.dto.GroupDTO
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Aligned with backend: changed users to roles
 * @created 12-22-2025
 */

import { RoleDTO } from './RoleDTO';

export interface GroupDTO {
  id?: number;
  name: string;
  description?: string;
  roles?: RoleDTO[];
}

export default GroupDTO;