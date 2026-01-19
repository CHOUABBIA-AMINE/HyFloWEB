/**
 * Location DTO - Localization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.localization.dto.LocationDTO
 * Updated: 01-19-2026 - Fixed property name designationEN -> designationEn
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
  designationAr: string; //
  designationEn: string; // Fixed: lowercase 'n' to match backend
  designationFr: string; // @NotBlank, max 100 chars (renamed from 'code' in U-005)
  state: string; // State field
  district: string; // District field
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
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Designation (Ar) must not exceed 100 characters");
  }
  
  // Place name validation (renamed from 'code')
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("Designation (En) must not exceed 100 characters");
  }
  
  // Place name validation (renamed from 'code')
  if (!data.designationFr) {
    errors.push("Place name is required");
  } else if (data.designationFr.length > 100) {
    errors.push("Place name must not exceed 100 characters");
  }
  
  // State validation
  if (!data.state) {
    errors.push("State is required");
  }
  
  // District validation (required if state is present)
  if (data.state && !data.district) {
    errors.push("District is required when state is specified");
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
