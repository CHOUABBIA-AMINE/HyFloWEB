/**
 * PipelineSegment DTO - Network Core Module
 * 
 * EXACTLY aligned with backend: dz.sh.trc.hyflo.network.core.dto.PipelineSegmentDTO
 * Backend SHA: 9611477ab9929990945ddddeb87eb33e829c9d53
 * 
 * Updated: 02-14-2026 12:26 - COMPLETE ALIGNMENT with latest backend structure
 * 
 * CRITICAL FIELD MAPPINGS:
 * - Backend 'ownerId' (Structure) → Frontend 'ownerId' (organizational owner)
 * - Backend 'departureFacilityId' → Frontend 'departureFacilityId' (REQUIRED)
 * - Backend 'arrivalFacilityId' → Frontend 'arrivalFacilityId' (REQUIRED)
 * 
 * Represents a segment of a pipeline with its physical properties, materials,
 * and position within the parent pipeline.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { AlloyDTO } from '../../common/dto/AlloyDTO';
import { PipelineDTO } from './PipelineDTO';
import { FacilityDTO } from './FacilityDTO';
import { CoordinateDTO } from '../../../general/localization/dto/CoordinateDTO';

/**
 * PipelineSegment DTO Interface
 * Exactly matches backend PipelineSegmentDTO.java structure
 */
export interface PipelineSegmentDTO {
  // ========== IDENTIFIER (from GenericDTO) ==========
  id?: number; // Long in Java

  // ========== REQUIRED STRING FIELDS ==========
  // @NotBlank @Size(min=2, max=20)
  code: string;
  
  // @NotBlank @Size(min=3, max=100)
  name: string;
  
  // ========== OPTIONAL DATE FIELDS ==========
  // LocalDate in backend → ISO string (YYYY-MM-DD) in frontend
  installationDate?: string;
  commissioningDate?: string;
  decommissioningDate?: string;
  
  // ========== REQUIRED PHYSICAL DIMENSIONS ==========
  // All are @NotNull @PositiveOrZero Double in backend
  diameter: number;
  length: number;
  thickness: number;
  roughness: number;
  
  // ========== REQUIRED POSITION FIELDS ==========
  // @NotNull @PositiveOrZero Double
  startPoint: number;
  endPoint: number;
  
  // ========== REQUIRED RELATIONSHIP IDs ==========
  // @NotNull Long
  operationalStatusId: number;
  constructionMaterialId: number;
  pipelineId: number;
  departureFacilityId: number;  // REQUIRED in backend
  arrivalFacilityId: number;    // REQUIRED in backend
  
  // ========== OPTIONAL RELATIONSHIP IDs ==========
  // Long (nullable)
  ownerId?: number;              // Structure (organizational owner) - OPTIONAL
  exteriorCoatingId?: number;    // Alloy - OPTIONAL
  interiorCoatingId?: number;    // Alloy - OPTIONAL
  
  // ========== COLLECTIONS ==========
  // Set<Long> in backend → number[] in frontend
  coordinateIds?: number[];      // Default: new HashSet<>()
  
  // ========== NESTED OBJECTS (populated in responses, READ-ONLY) ==========
  operationalStatus?: OperationalStatusDTO;
  owner?: StructureDTO;                    // Backend field name: 'owner'
  constructionMaterial?: AlloyDTO;
  exteriorCoating?: AlloyDTO;
  interiorCoating?: AlloyDTO;
  pipeline?: PipelineDTO;
  departureFacility?: FacilityDTO;
  arrivalFacility?: FacilityDTO;
  coordinates?: CoordinateDTO[];           // Set<CoordinateDTO> in backend
}

/**
 * Validates PipelineSegmentDTO according to EXACT backend constraints
 * Based on @NotNull, @NotBlank, @Size, @PositiveOrZero annotations
 */
export const validatePipelineSegmentDTO = (data: Partial<PipelineSegmentDTO>): string[] => {
  const errors: string[] = [];
  
  // ========== STRING VALIDATIONS ==========
  
  // Code: @NotBlank @Size(min=2, max=20)
  if (!data.code || data.code.trim() === '') {
    errors.push("Code is required");
  } else if (data.code.length < 2 || data.code.length > 20) {
    errors.push("Code must be between 2 and 20 characters");
  }
  
  // Name: @NotBlank @Size(min=3, max=100)
  if (!data.name || data.name.trim() === '') {
    errors.push("Name is required");
  } else if (data.name.length < 3 || data.name.length > 100) {
    errors.push("Name must be between 3 and 100 characters");
  }
  
  // ========== PHYSICAL DIMENSIONS: @NotNull @PositiveOrZero ==========
  
  const physicalFields: Array<{ name: keyof PipelineSegmentDTO; label: string }> = [
    { name: 'diameter', label: 'Diameter' },
    { name: 'length', label: 'Length' },
    { name: 'thickness', label: 'Thickness' },
    { name: 'roughness', label: 'Roughness' }
  ];
  
  physicalFields.forEach(({ name, label }) => {
    const value = data[name] as number | undefined;
    if (value === undefined || value === null) {
      errors.push(`${label} is required`);
    } else if (value < 0) {
      errors.push(`${label} must be zero or positive`);
    }
  });
  
  // ========== POSITION FIELDS: @NotNull @PositiveOrZero ==========
  
  if (data.startPoint === undefined || data.startPoint === null) {
    errors.push("Start point is required");
  } else if (data.startPoint < 0) {
    errors.push("Start point must be zero or positive");
  }
  
  if (data.endPoint === undefined || data.endPoint === null) {
    errors.push("End point is required");
  } else if (data.endPoint < 0) {
    errors.push("End point must be zero or positive");
  }
  
  // Business rule: endPoint must be greater than startPoint
  if (data.startPoint !== undefined && data.endPoint !== undefined && 
      data.startPoint >= data.endPoint) {
    errors.push("End point must be greater than start point");
  }
  
  // ========== REQUIRED RELATIONSHIPS: @NotNull ==========
  
  const requiredRelationships: Array<{ name: keyof PipelineSegmentDTO; label: string }> = [
    { name: 'operationalStatusId', label: 'Operational status' },
    { name: 'constructionMaterialId', label: 'Construction material' },
    { name: 'pipelineId', label: 'Pipeline' },
    { name: 'departureFacilityId', label: 'Departure facility' },  // REQUIRED
    { name: 'arrivalFacilityId', label: 'Arrival facility' }        // REQUIRED
  ];
  
  requiredRelationships.forEach(({ name, label }) => {
    const value = data[name] as number | undefined;
    if (value === undefined || value === null || value === 0) {
      errors.push(`${label} is required`);
    }
  });
  
  // ========== OPTIONAL RELATIONSHIPS ==========
  // ownerId, exteriorCoatingId, interiorCoatingId - no validation needed
  
  // ========== DATE FORMAT VALIDATION (if provided) ==========
  
  const dateFields: Array<keyof PipelineSegmentDTO> = [
    'installationDate', 
    'commissioningDate', 
    'decommissioningDate'
  ];
  
  dateFields.forEach(field => {
    const value = data[field] as string | undefined;
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      errors.push(`${field} must be in YYYY-MM-DD format`);
    }
  });
  
  return errors;
};

/**
 * Creates an empty PipelineSegmentDTO with default values
 * Matches backend @Builder.Default for coordinateIds = new HashSet<>()
 */
export const createEmptyPipelineSegmentDTO = (): Partial<PipelineSegmentDTO> => ({
  code: '',
  name: '',
  diameter: 0,
  length: 0,
  thickness: 0,
  roughness: 0,
  startPoint: 0,
  endPoint: 0,
  coordinateIds: [], // Default empty array (HashSet in backend)
  
  // Optional fields - undefined by default
  ownerId: undefined,
  exteriorCoatingId: undefined,
  interiorCoatingId: undefined,
  installationDate: undefined,
  commissioningDate: undefined,
  decommissioningDate: undefined,
});

/**
 * Type guard to check if a value is a valid PipelineSegmentDTO
 */
export const isPipelineSegmentDTO = (value: any): value is PipelineSegmentDTO => {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.code === 'string' &&
    typeof value.name === 'string' &&
    typeof value.diameter === 'number' &&
    typeof value.length === 'number' &&
    typeof value.thickness === 'number' &&
    typeof value.roughness === 'number' &&
    typeof value.startPoint === 'number' &&
    typeof value.endPoint === 'number' &&
    typeof value.operationalStatusId === 'number' &&
    typeof value.constructionMaterialId === 'number' &&
    typeof value.pipelineId === 'number' &&
    typeof value.departureFacilityId === 'number' &&
    typeof value.arrivalFacilityId === 'number'
  );
};
