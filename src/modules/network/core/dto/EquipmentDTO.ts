/**
 * Equipment DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.EquipmentDTO
 * 
 * Equipment entity for tracking facility equipment with manufacturing details,
 * maintenance records, and operational status.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { EquipmentTypeDTO } from '../../type/dto/EquipmentTypeDTO';
import { FacilityDTO } from './FacilityDTO';

export interface EquipmentDTO {
  // Identifier
  id?: number;

  // Core equipment information
  name: string; // @NotBlank, max 100 chars (required)
  code: string; // @NotBlank, max 50 chars (required)
  modelNumber: string; // @NotBlank, max 50 chars (required)
  serialNumber: string; // @NotBlank, max 100 chars (required)
  
  // Date fields (all required)
  manufacturingDate: string; // @NotNull, LocalDate (ISO format: YYYY-MM-DD)
  installationDate: string; // @NotNull, LocalDate (ISO format: YYYY-MM-DD)
  lastMaintenanceDate: string; // @NotNull, LocalDate (ISO format: YYYY-MM-DD)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  equipmentTypeId: number; // @NotNull (required)
  facilityId: number; // @NotNull (required)
  manufacturerId: number; // @NotNull (required) - References Vendor
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO;
  equipmentType?: EquipmentTypeDTO;
  facility?: FacilityDTO;
  manufacturer?: VendorDTO; // Vendor as manufacturer
}

/**
 * Validates EquipmentDTO according to backend constraints
 */
export const validateEquipmentDTO = (data: Partial<EquipmentDTO>): string[] => {
  const errors: string[] = [];
  
  // Name validation
  if (!data.name) {
    errors.push("Name is required");
  } else if (data.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 50) {
    errors.push("Code must not exceed 50 characters");
  }
  
  // Model number validation
  if (!data.modelNumber) {
    errors.push("Model number is required");
  } else if (data.modelNumber.length > 50) {
    errors.push("Model number must not exceed 50 characters");
  }
  
  // Serial number validation
  if (!data.serialNumber) {
    errors.push("Serial number is required");
  } else if (data.serialNumber.length > 100) {
    errors.push("Serial number must not exceed 100 characters");
  }
  
  // Date validations
  if (!data.manufacturingDate) {
    errors.push("Manufacturing date is required");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.manufacturingDate)) {
    errors.push("Manufacturing date must be in YYYY-MM-DD format");
  }
  
  if (!data.installationDate) {
    errors.push("Installation date is required");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.installationDate)) {
    errors.push("Installation date must be in YYYY-MM-DD format");
  }
  
  if (!data.lastMaintenanceDate) {
    errors.push("Last maintenance date is required");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastMaintenanceDate)) {
    errors.push("Last maintenance date must be in YYYY-MM-DD format");
  }
  
  // Relationship validations
  if (data.operationalStatusId === undefined || data.operationalStatusId === null) {
    errors.push("Operational status is required");
  }
  
  if (data.equipmentTypeId === undefined || data.equipmentTypeId === null) {
    errors.push("Equipment type is required");
  }
  
  if (data.facilityId === undefined || data.facilityId === null) {
    errors.push("Facility is required");
  }
  
  if (data.manufacturerId === undefined || data.manufacturerId === null) {
    errors.push("Manufacturer is required");
  }
  
  return errors;
};
