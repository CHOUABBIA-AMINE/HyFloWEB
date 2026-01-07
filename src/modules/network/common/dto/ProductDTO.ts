/**
 * Product DTO - Network Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.network.common.dto.ProductDTO
 * 
 * Represents petroleum products transported in the network with chemical/physical properties.
 * Includes multilingual designations and detailed product characteristics.
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface ProductDTO {
  // Identifier
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 10 chars (required)
  
  // Multilingual designations
  designationAr?: string; // Optional, max 100 chars (Arabic)
  designationEn?: string; // Optional, max 100 chars (English)
  designationFr: string; // @NotBlank, max 100 chars (required - French)
  
  // Physical/Chemical properties (all required)
  density: number; // @NotNull (required) - kg/m³ or specific gravity
  viscosity: number; // @NotNull (required) - cP or cSt
  flashPoint: number; // @NotNull (required) - °C
  sulfurContent: number; // @NotNull (required) - percentage or ppm
  
  // Safety flag (required)
  isHazardous: boolean; // @NotNull (required) - true if hazardous material
}

/**
 * Validates ProductDTO according to backend constraints
 */
export const validateProductDTO = (data: Partial<ProductDTO>): string[] => {
  const errors: string[] = [];
  
  // Code validation
  if (!data.code) {
    errors.push("Code is required");
  } else if (data.code.length > 10) {
    errors.push("Code must not exceed 10 characters");
  }
  
  // French designation validation (required)
  if (!data.designationFr) {
    errors.push("French designation is required");
  } else if (data.designationFr.length > 100) {
    errors.push("French designation must not exceed 100 characters");
  }
  
  // Optional designations validation
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push("Arabic designation must not exceed 100 characters");
  }
  
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push("English designation must not exceed 100 characters");
  }
  
  // Physical/Chemical properties validation
  if (data.density === undefined || data.density === null) {
    errors.push("Density is required");
  }
  
  if (data.viscosity === undefined || data.viscosity === null) {
    errors.push("Viscosity is required");
  }
  
  if (data.flashPoint === undefined || data.flashPoint === null) {
    errors.push("Flash point is required");
  }
  
  if (data.sulfurContent === undefined || data.sulfurContent === null) {
    errors.push("Sulfur content is required");
  }
  
  // Safety flag validation
  if (data.isHazardous === undefined || data.isHazardous === null) {
    errors.push("Hazardous flag is required");
  }
  
  return errors;
};
