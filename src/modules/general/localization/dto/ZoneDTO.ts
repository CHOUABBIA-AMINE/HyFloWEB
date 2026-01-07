/**
 * Zone DTO - Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.ZoneDTO
 * Updated: 01-07-2026 - Removed extra fields, fixed code constraint to max 10 chars
 * 
 * Note: Backend ZoneDTO does NOT have localityId field - removed from frontend
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface ZoneDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields (from backend)
  code: string; // @NotBlank, max 10 chars
  designationAr?: string; // max 100 chars
  designationEn?: string; // max 100 chars
  designationFr: string; // @NotBlank, max 100 chars
}

/**
 * Validates ZoneDTO according to backend constraints
 * @param data - Partial zone data to validate
 * @returns Array of validation error messages
 */
export const validateZoneDTO = (data: Partial<ZoneDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 10) {
    errors.push("Code must not exceed 10 characters");
  }
  
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  return errors;
};
