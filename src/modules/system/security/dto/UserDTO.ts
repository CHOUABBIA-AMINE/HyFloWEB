/**
 * User DTO
 * Matches backend: dz.mdn.iaas.system.security.dto.UserDTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  // Roles and groups
  roles?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  groups?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
}

export default UserDTO;
