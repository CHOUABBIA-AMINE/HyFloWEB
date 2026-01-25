/**
 * Validation Status DTO - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.dto.ValidationStatusDTO
 * Updated: 01-25-2026 - Initial creation aligned with backend
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface ValidationStatusDTO {
  // Identifier
  id?: number;

  // Core fields
  code: string; // @NotBlank, max 50 chars (required)
  designationAr?: string; // Max 100 chars (optional)
  designationEn?: string; // Max 100 chars (optional)
  designationFr: string; // @NotBlank, max 100 chars (required)
  descriptionAr?: string; // Max 500 chars (optional)
  descriptionEn?: string; // Max 500 chars (optional)
  descriptionFr?: string; // Max 500 chars (optional)

  // Audit fields
  createdAt?: string; // LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
  updatedAt?: string; // LocalDateTime (ISO format: YYYY-MM-DDTHH:mm:ss)
}

/**
 * Common validation status codes
 */
export enum ValidationStatusCode {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Validates ValidationStatusDTO according to backend constraints
 * @param data - Partial validation status data to validate
 * @returns Array of validation error messages
 */
export const validateValidationStatusDTO = (data: Partial<ValidationStatusDTO>): string[] => {
  const errors: string[] = [];

  // Code validation
  if (!data.code) {
    errors.push('Code is required');
  } else if (data.code.length > 50) {
    errors.push('Code must not exceed 50 characters');
  }

  // Designation FR validation (required)
  if (!data.designationFr) {
    errors.push('French designation is required');
  } else if (data.designationFr.length > 100) {
    errors.push('French designation must not exceed 100 characters');
  }

  // Optional designations validation
  if (data.designationAr && data.designationAr.length > 100) {
    errors.push('Arabic designation must not exceed 100 characters');
  }
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push('English designation must not exceed 100 characters');
  }

  // Optional descriptions validation
  if (data.descriptionAr && data.descriptionAr.length > 500) {
    errors.push('Arabic description must not exceed 500 characters');
  }
  if (data.descriptionEn && data.descriptionEn.length > 500) {
    errors.push('English description must not exceed 500 characters');
  }
  if (data.descriptionFr && data.descriptionFr.length > 500) {
    errors.push('French description must not exceed 500 characters');
  }

  return errors;
};

/**
 * UI helper: Get color for validation status
 */
export const getValidationStatusColor = (code?: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (code) {
    case ValidationStatusCode.DRAFT:
      return 'default';
    case ValidationStatusCode.PENDING:
      return 'warning';
    case ValidationStatusCode.VALIDATED:
      return 'success';
    case ValidationStatusCode.REJECTED:
      return 'error';
    case ValidationStatusCode.ARCHIVED:
      return 'secondary';
    default:
      return 'default';
  }
};
