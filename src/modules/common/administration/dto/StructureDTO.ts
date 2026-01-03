/**
 * Structure DTO
 * Data Transfer Object for Structure entity
 * Aligned with Backend: dz.sh.trc.hyflo.general.organization.dto.StructureDTO
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 12-23-2025
 * @updated 01-03-2026
 * @package common/administration
 */

import { StructureTypeDTO } from './StructureTypeDTO';

export interface StructureDTO {
  // Identifier
  id?: number;

  // Code (unique identifier)
  code: string;

  // Designations (multilingual)
  designationAr?: string;
  designationEn?: string;
  designationFr: string;

  // Structure Type relationship (required)
  structureTypeId: number;
  structureType?: StructureTypeDTO;

  // Parent Structure (self-referencing hierarchy)
  parentStructureId?: number;
  parentStructure?: StructureDTO;

  // Child Structures (inverse relationship)
  sources?: StructureDTO[];

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
