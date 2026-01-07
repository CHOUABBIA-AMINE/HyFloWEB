/**
 * Validation Utilities - General Type Module
 * 
 * Validation functions for General Type entities.
 * 
 * @author CHOUABBIA Amine
 */

import { isNotEmpty } from '../../common/utils/validation';

/**
 * Validate structure type designation (French)
 */
export const isValidDesignationFr = (designation: string | undefined | null): boolean => {
  return isNotEmpty(designation);
};

/**
 * Validate structure type designation (English)
 */
export const isValidDesignationEn = (designation: string | undefined | null): boolean => {
  return isNotEmpty(designation);
};

/**
 * Validate structure type code
 */
export const isValidTypeCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  // Type code should be uppercase letters with optional numbers
  return /^[A-Z0-9_]+$/.test(code!);
};

/**
 * Validate description length
 */
export const isValidDescription = (
  description: string | undefined | null,
  maxLength: number = 500
): boolean => {
  if (!description) return true; // Optional field
  return description.length <= maxLength;
};

// Re-export common validations
export { isNotEmpty };
