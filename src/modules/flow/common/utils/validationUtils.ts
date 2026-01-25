/**
 * Validation Utilities - Flow Common Module
 * 
 * Helper functions for validating Flow Common DTOs.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

import { VALIDATION_CONSTRAINTS } from './constants';

/**
 * Validate code format
 */
export function isValidCode(code: string): boolean {
  if (!code) return false;
  if (code.length < VALIDATION_CONSTRAINTS.CODE_MIN_LENGTH) return false;
  if (code.length > VALIDATION_CONSTRAINTS.CODE_MAX_LENGTH) return false;
  return VALIDATION_CONSTRAINTS.CODE_PATTERN.test(code);
}

/**
 * Validate designation length
 */
export function isValidDesignation(designation: string): boolean {
  if (!designation) return false;
  return designation.length <= VALIDATION_CONSTRAINTS.DESIGNATION_MAX_LENGTH;
}

/**
 * Validate description length
 */
export function isValidDescription(description: string): boolean {
  if (!description) return true; // Description is optional
  return description.length <= VALIDATION_CONSTRAINTS.DESCRIPTION_MAX_LENGTH;
}

/**
 * Get code validation error message
 */
export function getCodeValidationError(code: string): string | null {
  if (!code) return 'Code is required';
  if (code.length < VALIDATION_CONSTRAINTS.CODE_MIN_LENGTH) {
    return `Code must be at least ${VALIDATION_CONSTRAINTS.CODE_MIN_LENGTH} characters`;
  }
  if (code.length > VALIDATION_CONSTRAINTS.CODE_MAX_LENGTH) {
    return `Code must not exceed ${VALIDATION_CONSTRAINTS.CODE_MAX_LENGTH} characters`;
  }
  if (!VALIDATION_CONSTRAINTS.CODE_PATTERN.test(code)) {
    return 'Code must contain only uppercase letters, numbers, underscores, and hyphens';
  }
  return null;
}

/**
 * Get designation validation error message
 */
export function getDesignationValidationError(designation: string): string | null {
  if (!designation) return 'Designation is required';
  if (designation.length > VALIDATION_CONSTRAINTS.DESIGNATION_MAX_LENGTH) {
    return `Designation must not exceed ${VALIDATION_CONSTRAINTS.DESIGNATION_MAX_LENGTH} characters`;
  }
  return null;
}

/**
 * Get description validation error message
 */
export function getDescriptionValidationError(description: string): string | null {
  if (!description) return null; // Description is optional
  if (description.length > VALIDATION_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
    return `Description must not exceed ${VALIDATION_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`;
  }
  return null;
}
