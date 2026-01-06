/**
 * State DTO - Localization Module
 * Represents a state/province in the system
 * 
 * Aligned with backend: dz.sh.trc.hyflo.general.localization.dto.StateDTO
 * Updated: 01-06-2026 - Fixed field naming to match Java backend (designation* instead of name*)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface StateDTO {
  id?: number;
  code: string; // @NotBlank, max 2 chars
  countryId: number; // @NotBlank
  designationAr?: string; // max 100 chars
  designationEn?: string; // max 100 chars
  designationFr: string; // @NotBlank, max 100 chars
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Validates StateDTO according to backend constraints
 * @param data - Partial state data to validate
 * @returns Array of validation error messages
 */
export const validateStateDTO = (data: Partial<StateDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 2) {
    errors.push("Code must not exceed 2 characters");
  }
  
  if (!data.countryId) {
    errors.push("Country is required");
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
