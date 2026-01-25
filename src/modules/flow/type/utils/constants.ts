/**
 * Constants - Flow Type Module
 * 
 * Common constants used across the Flow Type module.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

/**
 * API endpoints for Flow Type module
 */
export const API_ENDPOINTS = {
  OPERATION_TYPES: '/api/flow/type/operationType',
  EVENT_TYPES: '/api/flow/type/eventType',
} as const;

/**
 * Operation Type Codes
 */
export const OPERATION_TYPE_CODES = {
  PRODUCED: 'PRODUCED',
  TRANSPORTED: 'TRANSPORTED',
  CONSUMED: 'CONSUMED',
} as const;

/**
 * Event Type Codes (Common examples)
 */
export const EVENT_TYPE_CODES = {
  EMERGENCY_SHUTDOWN: 'EMERGENCY_SHUTDOWN',
  MAINTENANCE: 'MAINTENANCE',
  SHUTDOWN: 'SHUTDOWN',
  LEAK: 'LEAK',
  PRESSURE_DROP: 'PRESSURE_DROP',
  EQUIPMENT_FAILURE: 'EQUIPMENT_FAILURE',
  INSPECTION: 'INSPECTION',
} as const;

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 20,
  SORT: 'code,asc',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 20,
  NAME_MAX_LENGTH: 100,
  DESIGNATION_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CODE_PATTERN: /^[A-Z0-9_-]+$/,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_CODE_FORMAT: 'Code must contain only uppercase letters, numbers, underscores, and hyphens',
  CODE_TOO_SHORT: `Code must be at least ${VALIDATION_CONSTRAINTS.CODE_MIN_LENGTH} characters`,
  CODE_TOO_LONG: `Code must not exceed ${VALIDATION_CONSTRAINTS.CODE_MAX_LENGTH} characters`,
  CODE_ALREADY_EXISTS: 'This code already exists',
  NOT_FOUND: 'Not found',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
} as const;

/**
 * Status codes
 */
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
