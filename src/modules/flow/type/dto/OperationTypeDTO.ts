/**
 * Operation Type DTO - Flow Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.type.dto.OperationTypeDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
 * 
 * Backend uses designationAr/designationFr/designationEn (not designationAr/Fr/En)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface OperationTypeDTO {
  // Identifier (from GenericDTO)
  id?: number;

  code: string; // @NotBlank, min 2, max 20 chars, pattern: PRODUCED|TRANSPORTED|CONSUMED (required)
  designationAr?: string; // Max 100 chars (optional)
  designationFr?: string; // Max 100 chars (optional)
  designationEn?: string; // Max 100 chars (optional)
}

/**
 * Operation type codes (as per backend pattern validation)
 */
export enum OperationTypeCode {
  PRODUCED = 'PRODUCED',
  TRANSPORTED = 'TRANSPORTED',
  CONSUMED = 'CONSUMED',
}

/**
 * Validates OperationTypeDTO according to backend constraints
 * @param data - Partial operation type data to validate
 * @returns Array of validation error messages
 */
export const validateOperationTypeDTO = (data: Partial<OperationTypeDTO>): string[] => {
  const errors: string[] = [];

  // Code validation
  if (!data.code) {
    errors.push('Operation type code is required');
  } else {
    if (data.code.length < 2 || data.code.length > 20) {
      errors.push('Code must be between 2 and 20 characters');
    }
    if (!['PRODUCED', 'TRANSPORTED', 'CONSUMED'].includes(data.code)) {
      errors.push('Code must be one of: PRODUCED, TRANSPORTED, CONSUMED');
    }
  }

  // Name validations
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push('Arabic designation must not exceed 100 characters');
  }
  if (data.designationFr && data.designationFr.length > 100) {
    errors.push('French designation must not exceed 100 characters');
  }
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push('English designation must not exceed 100 characters');
  }

  return errors;
};
