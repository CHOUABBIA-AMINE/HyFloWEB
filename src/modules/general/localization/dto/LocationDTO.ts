/**
 * Location DTO - Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * Updated: 01-07-2026 - Replaced designation fields with geographic coordinates
 * 
 * Note: Backend LocationDTO uses geographic coordinates (lat/lng/elevation),
 * NOT designation fields. Removed zoneId (not in backend).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocalityDTO } from './LocalityDTO';

export interface LocationDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields (from backend)
  code: string; // @NotBlank, max 10 chars
  latitude: number; // @NotNull
  longitude: number; // @NotNull
  elevation?: number; // Optional
  
  // Relationships (from backend)
  localityId: number; // @NotNull
  locality?: LocalityDTO; // Optional nested object
}

/**
 * Validates LocationDTO according to backend constraints
 * @param data - Partial location data to validate
 * @returns Array of validation error messages
 */
export const validateLocationDTO = (data: Partial<LocationDTO>): string[] => {
  const errors: string[] = [];
  
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
  
  if (!data.localityId) {
    errors.push("Locality is required");
  }
  
  return errors;
};
