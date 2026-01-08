/**
 * Structure Type DTO - General Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.general.type.dto.StructureTypeDTO
 * 
 * Type entity with multilingual designations (Arabic, English, French)
 * Used to classify organizational structures in the General module.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-03-2026
 * @updated 01-08-2026 - Aligned with backend schema pattern
 */

export interface StructureTypeDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 10 chars (required)
  designationAr?: string; // Optional, max 100 chars (Arabic designation)
  designationEn?: string; // Optional, max 100 chars (English designation)
  designationFr: string; // @NotBlank, max 100 chars (required - French designation)
}

/**
 * Validates StructureTypeDTO according to backend constraints
 */
export const validateStructureTypeDTO = (data: Partial<StructureTypeDTO>): string[] => {
  const errors: string[] = [];
  
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 10) {
    errors.push("Code must not exceed 10 characters");
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
  
  return errors;
};

export default StructureTypeDTO;
