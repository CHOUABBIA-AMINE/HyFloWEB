/**
 * Group DTO
 * Matches backend: dz.mdn.iaas.system.security.dto.GroupDTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

export interface GroupDTO {
  id: number;
  name: string;
  description?: string;
  users?: Array<{
    id: number;
    username: string;
  }>;
}

export default GroupDTO;
