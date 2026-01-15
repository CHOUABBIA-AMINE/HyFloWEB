/**
 * Pipeline DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.PipelineDTO
 * Updated: 01-15-2026 - Exact backend alignment (35 fields)
 * 
 * Complex pipeline entity with detailed physical properties, pressure/capacity specs,
 * material/coating information, and terminal connections.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { AlloyDTO } from '../../common/dto/AlloyDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { PipelineSystemDTO } from './PipelineSystemDTO';
import { TerminalDTO } from './TerminalDTO';

export interface PipelineDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, 2-20 chars (required)
  name: string; // @NotBlank, 3-100 chars (required)
  
  // Date fields (optional)
  installationDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  
  // Physical dimensions (all required, @NotNull, @PositiveOrZero)
  nominalDiameter: string; // String in backend (e.g., "24 inches")
  length: number; // Double - Total length
  nominalThickness: string; // String in backend (e.g., "0.5 inches")
  nominalRoughness: string; // String in backend (e.g., "0.045 mm")
  
  // Pressure specifications (all required, @NotNull, @PositiveOrZero)
  designMaxServicePressure: number; // Double - Design maximum pressure
  operationalMaxServicePressure: number; // Double - Actual maximum operating pressure
  designMinServicePressure: number; // Double - Design minimum pressure
  operationalMinServicePressure: number; // Double - Actual minimum operating pressure
  
  // Capacity specifications (all required, @NotNull, @PositiveOrZero)
  designCapacity: number; // Double - Design capacity
  operationalCapacity: number; // Double - Actual operating capacity
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  nominalConstructionMaterialId: number; // @NotNull (required) - Alloy material
  nominalExteriorCoatingId: number; // @NotNull (required) - Alloy coating
  nominalInteriorCoatingId: number; // @NotNull (required) - Alloy coating
  vendorId: number; // @NotNull (required)
  pipelineSystemId: number; // @NotNull (required)
  departureTerminalId: number; // @NotNull (required) - Starting terminal endpoint
  arrivalTerminalId: number; // @NotNull (required) - Ending terminal endpoint
  
  // Collections
  locationIds?: number[]; // Set<Long> - Array of location IDs along the pipeline route
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  nominalConstructionMaterial?: AlloyDTO;
  nominalExteriorCoating?: AlloyDTO;
  nominalInteriorCoating?: AlloyDTO;
  vendor?: VendorDTO;
  pipelineSystem?: PipelineSystemDTO;
  departureTerminal?: TerminalDTO; // Starting terminal
  arrivalTerminal?: TerminalDTO; // Ending terminal
}

/**
 * Validates PipelineDTO according to backend constraints
 */
export const validatePipelineDTO = (data: Partial<PipelineDTO>): string[] => {
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
  
  // Physical dimensions validation (String fields)
  if (!data.nominalDiameter) {
    errors.push("Nominal diameter is required");
  }
  if (!data.nominalThickness) {
    errors.push("Nominal thickness is required");
  }
  if (!data.nominalRoughness) {
    errors.push("Nominal roughness is required");
  }
  
  // Length validation (numeric)
  if (data.length === undefined || data.length === null) {
    errors.push("Length is required");
  } else if (data.length < 0) {
    errors.push("Length must be positive");
  }
  
  // Pressure specifications validation
  const pressureFields = [
    { name: 'designMaxServicePressure', label: 'Design max service pressure' },
    { name: 'operationalMaxServicePressure', label: 'Operational max service pressure' },
    { name: 'designMinServicePressure', label: 'Design min service pressure' },
    { name: 'operationalMinServicePressure', label: 'Operational min service pressure' }
  ] as const;
  
  pressureFields.forEach(({ name, label }) => {
    const value = data[name];
    if (value === undefined || value === null) {
      errors.push(`${label} is required`);
    } else if (value < 0) {
      errors.push(`${label} must be positive`);
    }
  });
  
  // Capacity specifications validation
  if (data.designCapacity === undefined || data.designCapacity === null) {
    errors.push("Design capacity is required");
  } else if (data.designCapacity < 0) {
    errors.push("Design capacity must be positive");
  }
  
  if (data.operationalCapacity === undefined || data.operationalCapacity === null) {
    errors.push("Operational capacity is required");
  } else if (data.operationalCapacity < 0) {
    errors.push("Operational capacity must be positive");
  }
  
  // Relationship validations
  const relationshipFields = [
    { name: 'operationalStatusId', label: 'Operational status' },
    { name: 'structureId', label: 'Structure' },
    { name: 'nominalConstructionMaterialId', label: 'Construction material' },
    { name: 'nominalExteriorCoatingId', label: 'Exterior coating' },
    { name: 'nominalInteriorCoatingId', label: 'Interior coating' },
    { name: 'vendorId', label: 'Vendor' },
    { name: 'pipelineSystemId', label: 'Pipeline system' },
    { name: 'departureTerminalId', label: 'Departure terminal' },
    { name: 'arrivalTerminalId', label: 'Arrival terminal' }
  ] as const;
  
  relationshipFields.forEach(({ name, label }) => {
    if (data[name] === undefined || data[name] === null) {
      errors.push(`${label} is required`);
    }
  });
  
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
