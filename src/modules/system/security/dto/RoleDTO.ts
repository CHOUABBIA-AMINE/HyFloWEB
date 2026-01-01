/**
 * Role DTO
 * Matches backend: dz.mdn.iaas.system.security.dto.RoleDTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

export interface RoleDTO {
  id: number;
  name: string;
  description?: string;
  permissions?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}

export default RoleDTO;
