/**
 * Structure DTO - Organization Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.organization.dto.StructureDTO
 * Updated: 01-08-2026 - Fixed StructureTypeDTO import path
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

import { StructureTypeDTO } from '../../type/dto/StructureTypeDTO';

export interface StructureDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 20 chars
  designationAr?: string; // max 100 chars
  designationEn?: string; // max 100 chars
  designationFr: string; // @NotBlank, max 100 chars
  shortName?: string; // max 50 chars

  // Relationship IDs
  structureTypeId: number; // @NotNull
  parentStructureId?: number; // Optional (for hierarchy)

  // Nested Objects (populated in responses)
  structureType?: StructureTypeDTO;
  parentStructure?: StructureDTO; // Self-reference for hierarchy
}

/**
 * Validates StructureDTO according to backend constraints
 */
export const validateStructureDTO = (data: Partial<StructureDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 20) {
    errors.push("Code must not exceed 20 characters");
  }
  
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  if (data.shortName && data.shortName.length > 50) {
    errors.push("Short name must not exceed 50 characters");
  }
  
  if (!data.structureTypeId) {
    errors.push("Structure type is required");
  }
  
  return errors;
};
