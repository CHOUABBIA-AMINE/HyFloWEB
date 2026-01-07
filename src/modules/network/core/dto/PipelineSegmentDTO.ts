/**
 * PipelineSegment DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.PipelineSegmentDTO
 * 
 * Represents a physical segment of a pipeline with specific dimensions,
 * materials, coatings, and position markers (startPoint/endPoint).
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';
import { AlloyDTO } from '../../common/dto/AlloyDTO';
import { PipelineDTO } from './PipelineDTO';

export interface PipelineSegmentDTO {
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
  diameter: number; // Segment diameter (required)
  length: number; // Segment length (required)
  thickness: number; // Wall thickness (required)
  roughness: number; // Surface roughness (required)
  
  // Position markers (required, @PositiveOrZero)
  startPoint: number; // Starting position along pipeline (required)
  endPoint: number; // Ending position along pipeline (required)
  
  // Required relationships (IDs)
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required)
  constructionMaterialId: number; // @NotNull (required) - Alloy material
  exteriorCoatingId: number; // @NotNull (required) - Alloy coating
  interiorCoatingId: number; // @NotNull (required) - Alloy coating
  pipelineId: number; // @NotNull (required) - Parent pipeline
  
  // Nested objects (populated in responses)
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
  constructionMaterial?: AlloyDTO;
  exteriorCoating?: AlloyDTO;
  interiorCoating?: AlloyDTO;
  pipeline?: PipelineDTO; // Parent pipeline
}

/**
 * Validates PipelineSegmentDTO according to backend constraints
 */
export const validatePipelineSegmentDTO = (data: Partial<PipelineSegmentDTO>): string[] => {
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
    { name: 'diameter', label: 'Diameter' },
    { name: 'length', label: 'Length' },
    { name: 'thickness', label: 'Thickness' },
    { name: 'roughness', label: 'Roughness' },
    { name: 'startPoint', label: 'Start point' },
    { name: 'endPoint', label: 'End point' }
  ] as const;
  
  physicalFields.forEach(({ name, label }) => {
    const value = data[name];
    if (value === undefined || value === null) {
      errors.push(`${label} is required`);
    } else if (value < 0) {
      errors.push(`${label} must be positive`);
    }
  });
  
  // Relationship validations
  const relationshipFields = [
    { name: 'operationalStatusId', label: 'Operational status' },
    { name: 'structureId', label: 'Structure' },
    { name: 'constructionMaterialId', label: 'Construction material' },
    { name: 'exteriorCoatingId', label: 'Exterior coating' },
    { name: 'interiorCoatingId', label: 'Interior coating' },
    { name: 'pipelineId', label: 'Pipeline' }
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
  
  // Logical validation: endPoint should be > startPoint
  if (data.startPoint !== undefined && data.startPoint !== null && 
      data.endPoint !== undefined && data.endPoint !== null) {
    if (data.endPoint <= data.startPoint) {
      errors.push("End point must be greater than start point");
    }
  }
  
  return errors;
};
