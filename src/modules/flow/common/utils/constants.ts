/**
 * Constants - Flow Common Module
 * 
 * Common constants used across the Flow Common module.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

/**
 * API endpoints for Flow Common module
 */
export const API_ENDPOINTS = {
  VALIDATION_STATUSES: '/api/flow/common/validationStatus',
  ALERT_STATUSES: '/api/flow/common/alertStatus',
  EVENT_STATUSES: '/api/flow/common/eventStatus',
  SEVERITIES: '/api/flow/common/severity',
  QUALITY_FLAGS: '/api/flow/common/qualityFlag',
  DATA_SOURCES: '/api/flow/common/dataSource',
} as const;

/**
 * Validation Status Codes
 */
export const VALIDATION_STATUS_CODES = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;

/**
 * Alert Status Codes
 */
export const ALERT_STATUS_CODES = {
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;

/**
 * Event Status Codes
 */
export const EVENT_STATUS_CODES = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * Severity Codes
 */
export const SEVERITY_CODES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

/**
 * Quality Flag Codes
 */
export const QUALITY_FLAG_CODES = {
  GOOD: 'GOOD',
  ESTIMATED: 'ESTIMATED',
  SUSPECT: 'SUSPECT',
  MISSING: 'MISSING',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
} as const;

/**
 * Data Source Codes
 */
export const DATA_SOURCE_CODES = {
  MANUAL_ENTRY: 'MANUAL_ENTRY',
  EXCEL_IMPORT: 'EXCEL_IMPORT',
  SCADA_EXPORT: 'SCADA_EXPORT',
  METER_READING: 'METER_READING',
  ESTIMATED: 'ESTIMATED',
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
  CODE_MAX_LENGTH: 50,
  DESIGNATION_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CODE_PATTERN: /^[A-Z0-9_-]+$/,
} as const;

/**
 * Severity priority order (for sorting)
 */
export const SEVERITY_PRIORITY = {
  [SEVERITY_CODES.LOW]: 1,
  [SEVERITY_CODES.MEDIUM]: 2,
  [SEVERITY_CODES.HIGH]: 3,
  [SEVERITY_CODES.CRITICAL]: 4,
} as const;

/**
 * Color coding for severities (for UI)
 */
export const SEVERITY_COLORS = {
  [SEVERITY_CODES.LOW]: '#52c41a',      // Green
  [SEVERITY_CODES.MEDIUM]: '#faad14',   // Yellow/Orange
  [SEVERITY_CODES.HIGH]: '#fa8c16',     // Orange
  [SEVERITY_CODES.CRITICAL]: '#f5222d', // Red
} as const;

/**
 * Color coding for alert statuses
 */
export const ALERT_STATUS_COLORS = {
  [ALERT_STATUS_CODES.ACTIVE]: '#f5222d',       // Red
  [ALERT_STATUS_CODES.ACKNOWLEDGED]: '#faad14', // Yellow
  [ALERT_STATUS_CODES.RESOLVED]: '#52c41a',     // Green
  [ALERT_STATUS_CODES.DISMISSED]: '#8c8c8c',    // Gray
} as const;

/**
 * Color coding for event statuses
 */
export const EVENT_STATUS_COLORS = {
  [EVENT_STATUS_CODES.PLANNED]: '#1890ff',      // Blue
  [EVENT_STATUS_CODES.IN_PROGRESS]: '#faad14',  // Yellow
  [EVENT_STATUS_CODES.COMPLETED]: '#52c41a',    // Green
  [EVENT_STATUS_CODES.CANCELLED]: '#8c8c8c',    // Gray
} as const;

/**
 * Color coding for quality flags
 */
export const QUALITY_FLAG_COLORS = {
  [QUALITY_FLAG_CODES.GOOD]: '#52c41a',         // Green
  [QUALITY_FLAG_CODES.ESTIMATED]: '#1890ff',    // Blue
  [QUALITY_FLAG_CODES.SUSPECT]: '#faad14',      // Yellow
  [QUALITY_FLAG_CODES.MISSING]: '#8c8c8c',      // Gray
  [QUALITY_FLAG_CODES.OUT_OF_RANGE]: '#f5222d', // Red
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
