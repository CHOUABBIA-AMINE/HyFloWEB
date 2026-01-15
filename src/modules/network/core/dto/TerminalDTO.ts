/**
 * Terminal DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.TerminalDTO
 * Updated: 01-15-2026 - Exact backend alignment (17 fields + 2 collections)
 * 
 * Represents a terminal facility in the hydrocarbon network (storage terminals,
 * export/import terminals, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocationDTO } from '../../../general/localization/dto/LocationDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { TerminalTypeDTO } from '../../type/dto/TerminalTypeDTO';

export interface TerminalDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, max 20 chars (required)
  name: string; // @NotBlank, max 100 chars (required)
  
  // Date fields (optional)
  installationDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  vendorId: number; // @NotNull (required)
  locationId: number; // @NotNull (required)
  terminalTypeId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO; // Optional nested object
  structure?: StructureDTO; // Optional nested object
  vendor?: VendorDTO; // Optional nested object
  location?: LocationDTO; // Optional nested object
  terminalType?: TerminalTypeDTO; // Optional nested object
  
  // Collections (many-to-many relationships)
  pipelineIds?: number[]; // Set<Long> - Associated pipeline IDs
  facilityIds?: number[]; // Set<Long> - Associated facility IDs
}

/**
 * Validates TerminalDTO according to backend constraints
 * @param data - Partial terminal data to validate
 * @returns Array of validation error messages
 */
export const validateTerminalDTO = (data: Partial<TerminalDTO>): string[] => {
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
  
  // Location validation
  if (data.locationId === undefined || data.locationId === null) {
    errors.push("Location is required");
  }
  
  // Terminal type validation
  if (data.terminalTypeId === undefined || data.terminalTypeId === null) {
    errors.push("Terminal type is required");
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
