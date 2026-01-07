/**
 * Alloy DTO - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.dto.AlloyDTO
 * 
 * Represents alloy materials used in pipeline construction, coatings, etc.
 * Includes multilingual designations and descriptions.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface AlloyDTO {
  // Identifier
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 20 chars (required)
  
  // Multilingual designations
  designationAr?: string; // Optional, max 100 chars (Arabic)
  designationEn?: string; // Optional, max 100 chars (English)
  designationFr: string; // @NotBlank, max 100 chars (required - French)
  
  // Multilingual descriptions
  descriptionAr?: string; // Optional, max 100 chars (Arabic)
  descriptionEn?: string; // Optional, max 100 chars (English)
  descriptionFr: string; // @NotBlank, max 100 chars (required - French)
}

/**
 * Validates AlloyDTO according to backend constraints
 */
export const validateAlloyDTO = (data: Partial<AlloyDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 20) {
    errors.push("Code must not exceed 20 characters");
  }
  
  // French designation validation (required)
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  // French description validation (required)
  if (!data.descriptionFr) {
    errors.push("French description is required");
  } else if (data.descriptionFr.length > 100) {
    errors.push("French description must not exceed 100 characters");
  }
  
  // Optional designations validation
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  // Optional descriptions validation
  if (data.descriptionAr && data.descriptionAr.length > 100) {
    errors.push("Arabic description must not exceed 100 characters");
  }
  
  if (data.descriptionEn && data.descriptionEn.length > 100) {
    errors.push("English description must not exceed 100 characters");
  }
  
  return errors;
};
