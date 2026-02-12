/**
 * Alert Status DTO - Flow Common Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.common.dto.AlertStatusDTO
 * Updated: 01-25-2026 - Aligned with backend (no extra fields)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface AlertStatusDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  designationAr?: string; // Max 100 chars (optional)
  designationEn?: string; // Max 100 chars (optional)
  designationFr: string; // @NotBlank, max 100 chars (required)
}

/**
 * Validates AlertStatusDTO according to backend constraints
 * @param data - Partial alert status data to validate
 * @returns Array of validation error messages
 */
export const validateAlertStatusDTO = (data: Partial<AlertStatusDTO>): string[] => {
  const errors: string[] = [];

  if (!data.designationFr) {
    errors.push('French designation is required');
  } else if (data.designationFr.length > 100) {
    errors.push('French designation must not exceed 100 characters');
  }

  if (data.designationAr && data.designationAr.length > 100) {
    errors.push('Arabic designation must not exceed 100 characters');
  }
  if (data.designationEn && data.designationEn.length > 100) {
    errors.push('English designation must not exceed 100 characters');
  }

  return errors;
};
