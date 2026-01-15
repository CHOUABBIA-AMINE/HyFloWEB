/**
 * Locality DTO - Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocalityDTO
 * Updated: 01-16-2026 - Fixed hierarchy: Locality does NOT have districtId
 * 
 * Correct Hierarchy: State → Locality → District → Location
 * (District belongs to Locality, not the other way around)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { StateDTO } from './StateDTO';

export interface LocalityDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields (from backend)
  code: string; // @NotBlank, max 10 chars
  designationAr?: string; // max 100 chars
  designationEn?: string; // max 100 chars
  designationFr: string; // @NotBlank, max 100 chars (required)
  
  // Relationships (from backend)
  stateId: number; // @NotNull - FK to State (required)
  
  // Nested objects (populated in responses)
  state?: StateDTO; // Optional nested object
}

/**
 * Validates LocalityDTO according to backend constraints
 * @param data - Partial locality data to validate
 * @returns Array of validation error messages
 */
export const validateLocalityDTO = (data: Partial<LocalityDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 10) {
    errors.push("Code must not exceed 10 characters");
  }
  
  // State relationship validation
  if (!data.stateId) {
    errors.push("State is required");
  } else if (data.stateId <= 0) {
    errors.push("State ID must be a positive number");
  }
  
  // French designation validation (required)
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  // Arabic designation validation (optional)
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  // English designation validation (optional)
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  return errors;
};
