/**
 * ProductionField DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.ProductionFieldDTO
 * Created: 01-15-2026 - Initial frontend implementation
 * 
 * Backend Author: MEDJERAB Abir
 * Frontend Author: CHOUABBIA Amine
 * 
 * @description
 * Represents a hydrocarbon production field in the network.
 * Production fields extract hydrocarbons and may be linked to processing plants.
 */

import { LocationDTO } from '../../../general/localization/dto/LocationDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { ProductionFieldTypeDTO } from '../../type/dto/ProductionFieldTypeDTO';
import { ProcessingPlantDTO } from './ProcessingPlantDTO';

export interface ProductionFieldDTO {
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
  productionFieldTypeId: number; // @NotNull (required)
  
  // Optional relationships (IDs)
  processingPlantId?: number; // Optional - associated processing plant
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO; // Optional nested object
  structure?: StructureDTO; // Optional nested object
  vendor?: VendorDTO; // Optional nested object
  location?: LocationDTO; // Optional nested object
  productionFieldType?: ProductionFieldTypeDTO; // Optional nested object
  processingPlant?: ProcessingPlantDTO; // Optional nested object
  
  // Collections (many-to-many relationships)
  partnerIds?: number[]; // Set<Long> - Associated partner IDs
  productIds?: number[]; // Set<Long> - Associated product IDs
}

/**
 * Validates ProductionFieldDTO according to backend constraints
 * @param data - Partial production field data to validate
 * @returns Array of validation error messages
 */
export const validateProductionFieldDTO = (data: Partial<ProductionFieldDTO>): string[] => {
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
  
  // Production field type validation
  if (data.productionFieldTypeId === undefined || data.productionFieldTypeId === null) {
    errors.push("ProductionFieldType is required");
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
