/**
 * PipelineSystem DTO - Network Core Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.core.dto.PipelineSystemDTO
 * 
 * Pipeline system entity representing a collection of related pipelines
 * that transport a specific product and belong to a specific organization structure.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { OperationalStatusDTO } from '../../common/dto/OperationalStatusDTO';
import { ProductDTO } from '../../common/dto/ProductDTO';
import { StructureDTO } from '../../../general/organization/dto/StructureDTO';

export interface PipelineSystemDTO {
  // Identifier
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 50 chars (required)
  name: string; // @NotBlank, max 100 chars (required)
  
  // Required relationships (IDs)
  productId: number; // @NotNull (required) - Product transported by this system
  operationalStatusId: number; // @NotNull (required)
  structureId: number; // @NotNull (required) - Owning organization structure
  
  // Nested objects (populated in responses)
  product?: ProductDTO;
  operationalStatus?: OperationalStatusDTO;
  structure?: StructureDTO;
}

/**
 * Validates PipelineSystemDTO according to backend constraints
 */
export const validatePipelineSystemDTO = (data: Partial<PipelineSystemDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 50) {
    errors.push("Code must not exceed 50 characters");
  }
  
  // Name validation
  if (!data.name) {
    errors.push("Name is required");
  } else if (data.name.length > 100) {
    errors.push("Name must not exceed 100 characters");
  }
  
  // Product validation
  if (data.productId === undefined || data.productId === null) {
    errors.push("Product is required");
  }
  
  // Operational status validation
  if (data.operationalStatusId === undefined || data.operationalStatusId === null) {
    errors.push("Operational status is required");
  }
  
  // Structure validation
  if (data.structureId === undefined || data.structureId === null) {
    errors.push("Structure is required");
  }
  
  return errors;
};
