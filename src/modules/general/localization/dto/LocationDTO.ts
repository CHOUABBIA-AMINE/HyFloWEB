/**
 * Location DTO - Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * Updated: 01-07-2026 - Added sequence and infrastructureId fields from backend update
 * 
 * Backend Update: U-001 (Jan 7, 2026) added sequence and infrastructureId fields
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocalityDTO } from './LocalityDTO';

export interface LocationDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields (from backend)
  sequence: number; // @NotBlank (required)
  code: string; // @NotBlank, max 10 chars
  latitude: number; // @NotNull
  longitude: number; // @NotNull
  elevation?: number; // Optional
  
  // Relationships (from backend)
  infrastructureId?: number; // Optional - Links to Infrastructure entity
  localityId?: number; // Optional (Long in backend can be null)
  locality?: LocalityDTO; // Optional nested object
}

/**
 * Validates LocationDTO according to backend constraints
 * @param data - Partial location data to validate
 * @returns Array of validation error messages
 */
export const validateLocationDTO = (data: Partial<LocationDTO>): string[] => {
  const errors: string[] = [];
  
  if (data.sequence === undefined || data.sequence === null) {
    errors.push("Sequence is required");
  } else if (data.sequence < 0) {
    errors.push("Sequence must be a non-negative number");
  }
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 10) {
    errors.push("Code must not exceed 10 characters");
  }
  
  if (data.latitude === undefined || data.latitude === null) {
    errors.push("Latitude is required");
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push("Latitude must be between -90 and 90 degrees");
  }
  
  if (data.longitude === undefined || data.longitude === null) {
    errors.push("Longitude is required");
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push("Longitude must be between -180 and 180 degrees");
  }
  
  return errors;
};
