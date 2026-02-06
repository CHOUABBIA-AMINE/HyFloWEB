/**
 * Pipeline DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.PipelineDTO
 * Updated: 02-06-2026 18:52 - CRITICAL: Backend removed locations, changed to coordinateIds + vendorIds Set
 * Updated: 02-06-2026 18:21 - Aligned with backend Model (nominalDiameter/Thickness as string, coordinates support)
 * Updated: 02-02-2026 - Fully aligned with backend (all ID fields are number, matching Java Long)
 * Updated: 01-26-2026 - Aligned with backend (added ownerId and managerId)
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
import { CoordinateDTO } from '../../../general/localization/dto/CoordinateDTO';

export interface PipelineDTO {
  // Identifier (from GenericDTO)
  id?: number; // Backend: Long

  // Core infrastructure fields
  code: string; // @NotBlank, 2-20 chars (required)
  name: string; // @NotBlank, 3-100 chars (required)
  
  // Date fields (optional)
  installationDate?: string; // Backend: LocalDate (ISO format: YYYY-MM-DD)
  commissioningDate?: string; // Backend: LocalDate (ISO format: YYYY-MM-DD)
  decommissioningDate?: string; // Backend: LocalDate (ISO format: YYYY-MM-DD)
  
  // Physical dimensions (all required, @NotNull)
  nominalDiameter: string; // Backend: String - Diameter with unit (e.g., "48 inches", "1200 mm")
  length: number; // Backend: Double - Total length in kilometers
  nominalThickness: string; // Backend: String - Wall thickness with unit (e.g., "12.7 mm", "0.5 inch")
  nominalRoughness: number; // Backend: Double - Surface roughness (e.g., 0.045)
  
  // Pressure specifications (all required, @NotNull, @Positive)
  designMaxServicePressure: number; // Backend: Double - Design maximum pressure in bar
  operationalMaxServicePressure: number; // Backend: Double - Actual maximum operating pressure in bar
  designMinServicePressure: number; // Backend: Double - Design minimum pressure in bar
  operationalMinServicePressure: number; // Backend: Double - Actual minimum operating pressure in bar
  
  // Capacity specifications (all required, @NotNull, @Positive)
  designCapacity: number; // Backend: Double - Design capacity in m³/day
  operationalCapacity: number; // Backend: Double - Actual operating capacity in m³/day
  
  // Required relationships (IDs) - Backend: Long, Frontend: number
  operationalStatusId: number; // @NotNull (required)
  ownerId: number; // @NotNull (required) - Owner structure
  managerId: number; // @NotNull (required) - Manager structure
  pipelineSystemId: number; // @NotNull (required)
  departureTerminalId: number; // @NotNull (required) - Starting terminal endpoint
  arrivalTerminalId: number; // @NotNull (required) - Ending terminal endpoint
  
  // Optional relationships (IDs) - Backend: Long, Frontend: number
  nominalConstructionMaterialId?: number; // Optional - Alloy material
  nominalExteriorCoatingId?: number; // Optional - Alloy coating
  nominalInteriorCoatingId?: number; // Optional - Alloy coating
  
  // Collections - Backend: Set<Long>, Frontend: number[]
  coordinateIds?: number[]; // Backend: Set<Long> coordinateIds - Coordinate IDs defining pipeline path
  vendorIds?: number[]; // Backend: Set<Long> vendorIds - Multiple vendor IDs (ManyToMany)
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO;
  owner?: StructureDTO; // Owner structure
  manager?: StructureDTO; // Manager structure
  nominalConstructionMaterial?: AlloyDTO;
  nominalExteriorCoating?: AlloyDTO;
  nominalInteriorCoating?: AlloyDTO;
  pipelineSystem?: PipelineSystemDTO;
  departureTerminal?: TerminalDTO; // Starting terminal
  arrivalTerminal?: TerminalDTO; // Ending terminal
  
  // DEPRECATED: Backend removed locations, use coordinateIds instead
  // locationIds?: number[]; // REMOVED from backend
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
  if (!data.nominalDiameter || data.nominalDiameter.trim() === '') {
    errors.push("Nominal diameter is required");
  } else if (data.nominalDiameter.length > 255) {
    errors.push("Nominal diameter must not exceed 255 characters");
  }
  
  if (!data.nominalThickness || data.nominalThickness.trim() === '') {
    errors.push("Nominal thickness is required");
  } else if (data.nominalThickness.length > 255) {
    errors.push("Nominal thickness must not exceed 255 characters");
  }
  
  if (data.nominalRoughness === undefined || data.nominalRoughness === null) {
    errors.push("Nominal roughness is required");
  } else if (data.nominalRoughness <= 0) {
    errors.push("Nominal roughness must be positive");
  }
  
  // Length validation (numeric)
  if (data.length === undefined || data.length === null) {
    errors.push("Length is required");
  } else if (data.length <= 0) {
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
    } else if (value <= 0) {
      errors.push(`${label} must be positive`);
    }
  });
  
  // Capacity specifications validation
  if (data.designCapacity === undefined || data.designCapacity === null) {
    errors.push("Design capacity is required");
  } else if (data.designCapacity <= 0) {
    errors.push("Design capacity must be positive");
  }
  
  if (data.operationalCapacity === undefined || data.operationalCapacity === null) {
    errors.push("Operational capacity is required");
  } else if (data.operationalCapacity <= 0) {
    errors.push("Operational capacity must be positive");
  }
  
  // Relationship validations
  const relationshipFields = [
    { name: 'operationalStatusId', label: 'Operational status' },
    { name: 'ownerId', label: 'Owner structure' },
    { name: 'managerId', label: 'Manager structure' },
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

/**
 * Creates an empty PipelineDTO with default values
 */
export const createEmptyPipelineDTO = (): Partial<PipelineDTO> => ({
  code: '',
  name: '',
  nominalDiameter: '',          // String with unit
  length: 0,
  nominalThickness: '',         // String with unit
  nominalRoughness: 0,          // Numeric value
  designMaxServicePressure: 0,
  operationalMaxServicePressure: 0,
  designMinServicePressure: 0,
  operationalMinServicePressure: 0,
  designCapacity: 0,
  operationalCapacity: 0,
  coordinateIds: [],            // NEW: coordinateIds instead of locationIds
  vendorIds: [],                // NEW: vendorIds array (Set in backend)
});