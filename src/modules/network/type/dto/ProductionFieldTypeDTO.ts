/**
 * ProductionFieldType DTO - Network Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.type.dto.ProductionFieldTypeDTO
 * 
 * Type entity with multilingual designations (Arabic, English, French)
 * Used to classify ProductionField entities in the Network module.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 * @created 01-15-2026
 */

export interface ProductionFieldTypeDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 20 chars (required)
  designationAr?: string; // Optional, max 100 chars (Arabic designation)
  designationEn?: string; // Optional, max 100 chars (English designation)
  designationFr: string; // @NotBlank, max 100 chars (required - French designation)
}

/**
 * Validates ProductionFieldTypeDTO according to backend constraints
 * @param data - Partial production field type data to validate
 * @returns Array of validation error messages
 */
export const validateProductionFieldTypeDTO = (data: Partial<ProductionFieldTypeDTO>): string[] => {
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
  
  return errors;
};
