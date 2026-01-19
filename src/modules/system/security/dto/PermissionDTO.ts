/**
 * Permission DTO
 * Matches backend: dz.sh.trc.hyflo.system.security.dto.PermissionDTO
 * 
 * @author CHOUABBIA Amine
 * @updated 01-19-2026 - Aligned with backend: made id optional for creation
 * @created 12-22-2025
 */

export interface PermissionDTO {
  id?: number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export default PermissionDTO;