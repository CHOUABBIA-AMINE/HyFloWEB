/**
 * Constants - Network Common Module
 * 
 * Common constants used across the Network Common module.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  ALLOYS: '/api/network/common/alloys',
  OPERATIONAL_STATUSES: '/api/network/common/operational-statuses',
  PARTNERS: '/api/network/common/partners',
  PRODUCTS: '/api/network/common/products',
  VENDORS: '/api/network/common/vendors',
} as const;

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 20,
  SORT: 'id,asc',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  CODE_MAX_LENGTH: 20,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  EMAIL_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  ADDRESS_MAX_LENGTH: 255,
  URL_MAX_LENGTH: 255,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  ALREADY_EXISTS: 'Already exists',
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

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  ISO_TIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'MM/DD/YYYY',
  DISPLAY_TIME: 'MM/DD/YYYY HH:mm',
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
} as const;
