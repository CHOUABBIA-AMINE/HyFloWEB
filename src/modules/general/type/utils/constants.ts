/**
 * Constants - General Type Module
 * 
 * Constants for General Type entities.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  STRUCTURE_TYPES: '/api/general/type/structure-types',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  CODE_MAX_LENGTH: 50,
  DESIGNATION_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  LOCALE: 'fr' as 'fr' | 'en',
  IS_ACTIVE: true,
} as const;

/**
 * Locales
 */
export const LOCALES = {
  FRENCH: 'fr',
  ENGLISH: 'en',
} as const;

/**
 * Sort options
 */
export const SORT_OPTIONS = [
  { value: 'code,asc', label: 'Code (A-Z)' },
  { value: 'code,desc', label: 'Code (Z-A)' },
  { value: 'designationFr,asc', label: 'Designation FR (A-Z)' },
  { value: 'designationFr,desc', label: 'Designation FR (Z-A)' },
  { value: 'designationEn,asc', label: 'Designation EN (A-Z)' },
  { value: 'designationEn,desc', label: 'Designation EN (Z-A)' },
] as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  CODE_REQUIRED: 'Code is required',
  CODE_INVALID: 'Code must be uppercase letters and numbers only',
  DESIGNATION_FR_REQUIRED: 'French designation is required',
  DESIGNATION_EN_REQUIRED: 'English designation is required',
  DESCRIPTION_TOO_LONG: 'Description is too long',
  NOT_FOUND: 'Structure type not found',
  ALREADY_EXISTS: 'Structure type already exists',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Structure type created successfully',
  UPDATED: 'Structure type updated successfully',
  DELETED: 'Structure type deleted successfully',
} as const;
