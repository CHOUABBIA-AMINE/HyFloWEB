/**
 * Event Type DTO - Flow Type Module
 * 
 * Strictly aligned with backend: dz.sh.trc.hyflo.flow.type.dto.EventTypeDTO
 * Updated: 01-25-2026 - Aligned with backend using FacilityDTO template
 * 
 * Backend uses designationAr/Fr/En (not nameAr/Fr/En like OperationType)
 * 
 * @author MEDJERAB Abir (Backend), CHOUABBIA Amine (Frontend)
 */

export interface EventTypeDTO {
  // Identifier (from GenericDTO)
  id?: number;

  // Core fields
  code: string; // @NotBlank, min 2, max 20 chars, pattern: ^[A-Z0-9_-]+$ (required)
  designationAr?: string; // Max 100 chars (optional)
  designationFr: string; // @NotBlank, max 100 chars (required)
  designationEn?: string; // Max 100 chars (optional)
}

/**
 * Common event type codes
 */
export enum EventTypeCode {
  EMERGENCY_SHUTDOWN = 'EMERGENCY_SHUTDOWN',
  MAINTENANCE = 'MAINTENANCE',
  SHUTDOWN = 'SHUTDOWN',
  LEAK = 'LEAK',
  PRESSURE_DROP = 'PRESSURE_DROP',
  EQUIPMENT_FAILURE = 'EQUIPMENT_FAILURE',
  INSPECTION = 'INSPECTION',
}

/**
 * Validates EventTypeDTO according to backend constraints
 * @param data - Partial event type data to validate
 * @returns Array of validation error messages
 */
export const validateEventTypeDTO = (data: Partial<EventTypeDTO>): string[] => {
  const errors: string[] = [];

  // Code validation
  if (!data.code) {
    errors.push('Event type code is required');
  } else {
    if (data.code.length < 2 || data.code.length > 20) {
      errors.push('Code must be between 2 and 20 characters');
    }
    if (!/^[A-Z0-9_-]+$/.test(data.code)) {
      errors.push('Code must contain only uppercase letters, numbers, hyphens, and underscores');
    }
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

  return errors;
};
