/**
 * Facility DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.FacilityDTO
 * Updated: 01-07-2026 - Synced with backend U-006 update
 * 
 * Backend Updates History:
 * - U-006 (Jan 7, 2026, 10:59 AM): Added locationId field
 *   • Facility now has location reference (relationship inverted in U-005)
 *   • Location is now an independent entity
 *   • Facility → has → Location (not Location → has → Facility)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocationDTO } from '../../../general/localization/dto/LocationDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';

export interface FacilityDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, max 20 chars (required)
  name: string; // @NotBlank, max 100 chars (required)
  
  // Date fields
  installationDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  vendorId: number; // @NotNull (required)
  locationId: number; // @NotNull (required) - ADDED in U-006
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO; // Optional nested object
  structure?: StructureDTO; // Optional nested object
  vendor?: VendorDTO; // Optional nested object
  location?: LocationDTO; // Optional nested object - ADDED in U-006
}

/**
 * Validates FacilityDTO according to backend constraints
 * @param data - Partial facility data to validate
 * @returns Array of validation error messages
 */
export const validateFacilityDTO = (data: Partial<FacilityDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 20) {
    errors.push("Code must not exceed 20 characters");
  }
  
  // Name validation
  if (!data.name) {
    errors.push("Name is required");
  } else if (data.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  
  // Operational status validation
  if (data.operationalStatusId === undefined || data.operationalStatusId === null) {
    errors.push("Operational status is required");
  }
  
  // Structure validation
  if (data.structureId === undefined || data.structureId === null) {
    errors.push("Structure is required");
  }
  
  // Vendor validation
  if (data.vendorId === undefined || data.vendorId === null) {
    errors.push("Vendor is required");
  }
  
  // Location validation (ADDED in U-006)
  if (data.locationId === undefined || data.locationId === null) {
    errors.push("Location is required");
  }
  
  // Date format validation (if provided)
  const dateFields = ['installationDate', 'commissioningDate', 'decommissioningDate'] as const;
  dateFields.forEach(field => {
    const value = data[field];
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      errors.push(`${field} must be in YYYY-MM-DD format`);
    }
  });
  
  return errors;
};
