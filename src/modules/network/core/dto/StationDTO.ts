/**
 * Station DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.StationDTO
 * Updated: 01-15-2026 - Exact backend alignment (18 fields + 1 collection)
 * 
 * Represents a station facility in the hydrocarbon network (pump stations, 
 * compressor stations, etc.).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { LocationDTO } from '../../../general/localization/dto/LocationDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { StationTypeDTO } from '../../type/dto/StationTypeDTO';
import { PipelineSystemDTO } from './PipelineSystemDTO';

export interface StationDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, 2-20 chars (required)
  name: string; // @NotBlank, 3-100 chars (required)
  
  // Date fields (optional)
  installationDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  vendorId: number; // @NotNull (required)
  locationId: number; // @NotNull (required)
  stationTypeId: number; // @NotNull (required)
  pipelineSystemId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO; // Optional nested object
  structure?: StructureDTO; // Optional nested object
  vendor?: VendorDTO; // Optional nested object
  location?: LocationDTO; // Optional nested object
  stationType?: StationTypeDTO; // Optional nested object
  pipelineSystem?: PipelineSystemDTO; // Optional nested object
  
  // Collections (many-to-many relationships)
  pipelineIds?: number[]; // Set<Long> - Associated pipeline IDs
}

/**
 * Validates StationDTO according to backend constraints
 * @param data - Partial station data to validate
 * @returns Array of validation error messages
 */
export const validateStationDTO = (data: Partial<StationDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length < 2 || data.code.length > 20) {
    errors.push("Code must be between 2 and 20 characters");
  }
  
  // Name validation
  if (!data.name) {
    errors.push("Name is required");
  } else if (data.name.length < 3 || data.name.length > 100) {
    errors.push("Name must be between 3 and 100 characters");
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
  
  // Station type validation
  if (data.stationTypeId === undefined || data.stationTypeId === null) {
    errors.push("Station type is required");
  }
  
  // Pipeline system validation
  if (data.pipelineSystemId === undefined || data.pipelineSystemId === null) {
    errors.push("Pipeline system is required");
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
