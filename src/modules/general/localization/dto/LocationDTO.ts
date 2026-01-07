/**
 * Location DTO - Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * Updated: 01-07-2026 - Synced with backend U-005 update
 * 
 * Backend Updates History:
 * - U-001 (Jan 7, 2026, 10:04 AM): Added sequence field
 * - U-004 (Jan 7, 2026, 10:30 AM): Renamed infrastructureId → facilityId
 * - U-005 (Jan 7, 2026, 10:48 AM): MAJOR CHANGES
 *   • Renamed code → placeName
 *   • REMOVED facilityId (relationship inverted - Facility now has locationId)
 *   • Location is now an independent entity
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocalityDTO } from './LocalityDTO';

export interface LocationDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  sequence: number; // @NotBlank (required)
  placeName: string; // @NotBlank, max 10 chars (renamed from 'code' in U-005)
  latitude: number; // @NotNull (required)
  longitude: number; // @NotNull (required)
  elevation?: number; // Optional
  
  // Relationships
  localityId?: number; // Optional - Links to Locality entity
  
  // Nested objects (populated in responses)
  locality?: LocalityDTO; // Optional nested object
  
  // REMOVED in U-005: facilityId
  // Note: Relationship inverted - Facility now has locationId, not Location has facilityId
}

/**
 * Validates LocationDTO according to backend constraints
 * @param data - Partial location data to validate
 * @returns Array of validation error messages
 */
export const validateLocationDTO = (data: Partial<LocationDTO>): string[] => {
  const errors: string[] = [];
  
  // Sequence validation
  if (data.sequence === undefined || data.sequence === null) {
    errors.push("Sequence is required");
  } else if (data.sequence < 0) {
    errors.push("Sequence must be a non-negative number");
  }
  
  // Place name validation (renamed from 'code')
  if (!data.placeName) {
    errors.push("Place name is required");
  } else if (data.placeName.length > 10) {
    errors.push("Place name must not exceed 10 characters");
  }
  
  // Latitude validation
  if (data.latitude === undefined || data.latitude === null) {
    errors.push("Latitude is required");
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push("Latitude must be between -90 and 90 degrees");
  }
  
  // Longitude validation
  if (data.longitude === undefined || data.longitude === null) {
    errors.push("Longitude is required");
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push("Longitude must be between -180 and 180 degrees");
  }
  
  return errors;
};
