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
  code: string; // @NotBlank, min 2, max 20 chars, pattern: ^[A-Z0-9_-]+$ (required)
  designationAr?: string; // Max 100 chars (optional)
  designationEn?: string; // Max 100 chars (optional)
  designationFr: string; // @NotBlank, max 100 chars (required)
  descriptionAr?: string; // Max 255 chars (optional)
  descriptionEn?: string; // Max 255 chars (optional)
  descriptionFr?: string; // Max 255 chars (optional)
}

/**
 * Common alert status codes
 */
export enum AlertStatusCode {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

/**
 * Validates AlertStatusDTO according to backend constraints
 * @param data - Partial alert status data to validate
 * @returns Array of validation error messages
 */
export const validateAlertStatusDTO = (data: Partial<AlertStatusDTO>): string[] => {
  const errors: string[] = [];

  if (!data.code) {
    errors.push('Alert status code is required');
  } else {
    if (data.code.length < 2 || data.code.length > 20) {
      errors.push('Code must be between 2 and 20 characters');
    }
    if (!/^[A-Z0-9_-]+$/.test(data.code)) {
      errors.push('Code must contain only uppercase letters, numbers, hyphens, and underscores');
    }
  }

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

  if (data.descriptionAr && data.descriptionAr.length > 255) {
    errors.push('Arabic description must not exceed 255 characters');
  }
  if (data.descriptionEn && data.descriptionEn.length > 255) {
    errors.push('English description must not exceed 255 characters');
  }
  if (data.descriptionFr && data.descriptionFr.length > 255) {
    errors.push('French description must not exceed 255 characters');
  }

  return errors;
};

/**
 * UI helper: Get color for alert status
 */
export const getAlertStatusColor = (code?: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (code) {
    case AlertStatusCode.ACTIVE:
      return 'error';
    case AlertStatusCode.ACKNOWLEDGED:
      return 'warning';
    case AlertStatusCode.RESOLVED:
      return 'success';
    case AlertStatusCode.DISMISSED:
      return 'secondary';
    default:
      return 'default';
  }
};
