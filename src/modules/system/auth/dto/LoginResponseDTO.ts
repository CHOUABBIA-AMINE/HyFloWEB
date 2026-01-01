/**
 * Login Response DTO
 * Matches backend: dz.mdn.iaas.system.auth.dto.LoginResponseDTO
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 */

export interface LoginResponseDTO {
  token: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string; // Username might be in response
}
