/**
 * Permission DTO
 * Matches backend: dz.mdn.iaas.system.security.dto.PermissionDTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

export interface PermissionDTO {
  id: number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export default PermissionDTO;
