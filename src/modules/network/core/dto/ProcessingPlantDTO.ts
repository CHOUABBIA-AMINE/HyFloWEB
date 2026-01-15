/**
 * ProcessingPlant DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.ProcessingPlantDTO
 * Created: 01-15-2026 - Initial frontend implementation
 * 
 * Backend Author: MEDJERAB Abir
 * Frontend Author: CHOUABBIA Amine
 * 
 * @description
 * Represents a processing plant facility in the hydrocarbon network.
 * Processing plants transform or process hydrocarbons from production fields.
 */

import { LocationDTO } from '../../../general/localization/dto/LocationDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { ProcessingPlantTypeDTO } from '../../type/dto/ProcessingPlantTypeDTO';

export interface ProcessingPlantDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, min 2, max 20 chars (required)
  name: string; // @NotBlank, min 3, max 100 chars (required)
  
  // Date fields
  installationDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  
  // Capacity
  capacity: number; // double (required)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  vendorId: number; // @NotNull (required)
  locationId: number; // @NotNull (required)
  processingPlantTypeId: number; // @NotNull (required)
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO; // Optional nested object
  structure?: StructureDTO; // Optional nested object
  vendor?: VendorDTO; // Optional nested object
  location?: LocationDTO; // Optional nested object
  processingPlantType?: ProcessingPlantTypeDTO; // Optional nested object
  
  // Collections (many-to-many relationships)
  pipelineIds?: number[]; // Set<Long> - Associated pipeline IDs
  partnerIds?: number[]; // Set<Long> - Associated partner IDs
  productIds?: number[]; // Set<Long> - Associated product IDs
}

/**
 * Validates ProcessingPlantDTO according to backend constraints
 * @param data - Partial processing plant data to validate
 * @returns Array of validation error messages
 */
export const validateProcessingPlantDTO = (data: Partial<ProcessingPlantDTO>): string[] => {
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
  
  // Capacity validation
  if (data.capacity === undefined || data.capacity === null) {
    errors.push("Capacity is required");
  } else if (data.capacity < 0) {
    errors.push("Capacity must be positive");
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
  
  // Processing plant type validation
  if (data.processingPlantTypeId === undefined || data.processingPlantTypeId === null) {
    errors.push("ProcessingPlantType is required");
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
