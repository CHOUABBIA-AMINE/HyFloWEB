/**
 * Structure DTO
 * Data Transfer Object for Structure entity
 * Matches: dz.mdn.iaas.common.administration.model.Structure.java
 * 
 * @author CHOUABBIA Amine
 * @created 12-23-2025
 * @updated 12-28-2025
 */

import { StructureTypeDTO } from './StructureTypeDTO';
import { LocalityDTO } from './LocalityDTO';

export interface StructureDTO {
  id: number;
  
  // Designations (multilingual)
  code: string;
  designationAr?: string;
  designationEn?: string;
  designationFr: string;
  
  // Legacy fields for backward compatibility
  label?: string;  // Maps to designationFr
  description?: string;  // Maps to designationEn
  address?: string;
  
  // Structure Type relationship
  structureTypeId: number;
  structureType?: StructureTypeDTO;
  
  // Legacy field for backward compatibility
  typeId?: number;  // Maps to structureTypeId
  type?: StructureTypeDTO;
  
  // Locality relationship (if applicable)
  localityId?: number;
  locality?: LocalityDTO;
  
  // Parent Structure (self-referencing hierarchy)
  parentStructureId?: number;
  parentStructure?: StructureDTO;
  
  // Child Structures (inverse relationship)
  sources?: StructureDTO[];
  
  // Organization (alias for parentStructure - top-level structure)
  organizationId?: number;
  organization?: StructureDTO;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
