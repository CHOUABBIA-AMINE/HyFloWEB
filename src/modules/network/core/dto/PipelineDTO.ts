/**
 * Pipeline DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.PipelineDTO
 * 
 * Complex pipeline entity with detailed physical properties, pressure/capacity specs,
 * material/coating information, and facility connections.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { AlloyDTO } from '../../common/dto/AlloyDTO';
import { VendorDTO } from '../../common/dto/VendorDTO';
import { PipelineSystemDTO } from './PipelineSystemDTO';
import { FacilityDTO } from './FacilityDTO';

export interface PipelineDTO {
  // Identifier
  id?: number;

  // Core infrastructure fields
  code: string; // @NotBlank, 2-20 chars (required)
  name: string; // @NotBlank, 3-100 chars (required)
  
  // Date fields (optional)
  installationDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // LocalDate (ISO format: YYYY-MM-DD)
  
  // Physical dimensions (all required, @PositiveOrZero)
  nominalDiameter: number; // Nominal diameter (required)
  length: number; // Total length (required)
  nominalThickness: number; // Wall thickness (required)
  nominalRoughness: number; // Surface roughness (required)
  
  // Pressure specifications (all required, @PositiveOrZero)
  designMaxServicePressure: number; // Design maximum pressure (required)
  operationalMaxServicePressure: number; // Actual maximum operating pressure (required)
  designMinServicePressure: number; // Design minimum pressure (required)
  operationalMinServicePressure: number; // Actual minimum operating pressure (required)
  
  // Capacity specifications (all required, @PositiveOrZero)
  designCapacity: number; // Design capacity (required)
  operationalCapacity: number; // Actual operating capacity (required)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  nominalConstructionMaterialId: number; // @NotNull (required) - Alloy material
  nominalExteriorCoatingId: number; // @NotNull (required) - Alloy coating
  nominalInteriorCoatingId: number; // @NotNull (required) - Alloy coating
  vendorId: number; // @NotNull (required)
  pipelineSystemId: number; // @NotNull (required)
  departureFacilityId: number; // @NotNull (required) - Starting point
  arrivalFacilityId: number; // @NotNull (required) - Ending point
  
  // Collections
  locationIds?: number[]; // Array of location IDs along the pipeline route
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  nominalConstructionMaterial?: AlloyDTO;
  nominalExteriorCoating?: AlloyDTO;
  nominalInteriorCoating?: AlloyDTO;
  vendor?: VendorDTO;
  pipelineSystem?: PipelineSystemDTO;
  departureFacility?: FacilityDTO;
  arrivalFacility?: FacilityDTO;
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
  
  // Physical dimensions validation
  const physicalFields = [
    { name: 'nominalDiameter', label: 'Nominal diameter' },
    { name: 'length', label: 'Length' },
    { name: 'nominalThickness', label: 'Nominal thickness' },
    { name: 'nominalRoughness', label: 'Nominal roughness' }
  ] as const;
  
  physicalFields.forEach(({ name, label }) => {
    const value = data[name];
    if (value === undefined || value === null) {
      errors.push(`${label} is required`);
    } else if (value < 0) {
      errors.push(`${label} must be positive`);
    }
  });
  
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
    { name: 'departureFacilityId', label: 'Departure facility' },
    { name: 'arrivalFacilityId', label: 'Arrival facility' }
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
