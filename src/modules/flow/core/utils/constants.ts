/**
 * Constants - Flow Core Module
 * 
 * Common constants used across the Flow Core module.
 * 
 * @author CHOUABBIA Amine
 * @created 01-25-2026
 */

/**
 * API endpoints for Flow Core module
 */
export const API_ENDPOINTS = {
  FLOW_READINGS: '/api/flow/core/flowReading',
  FLOW_OPERATIONS: '/api/flow/core/flowOperation',
  FLOW_ALERTS: '/api/flow/core/flowAlert',
  FLOW_EVENTS: '/api/flow/core/flowEvent',
  FLOW_FORECASTS: '/api/flow/core/flowForecast',
  FLOW_THRESHOLDS: '/api/flow/core/flowThreshold',
} as const;

/**
 * Measurement constraints for flow readings
 */
export const MEASUREMENT_CONSTRAINTS = {
  PRESSURE_MIN: 0,        // bar
  PRESSURE_MAX: 200,      // bar
  TEMPERATURE_MIN: -50,   // °C
  TEMPERATURE_MAX: 200,   // °C
  FLOW_RATE_MIN: 0,       // m³/h
  FLOW_RATE_MAX: 10000,   // m³/h
  VOLUME_MIN: 0,          // m³
  VOLUME_MAX: 1000000,    // m³
} as const;

/**
 * Units for measurements
 */
export const MEASUREMENT_UNITS = {
  PRESSURE: 'bar',
  TEMPERATURE: '°C',
  FLOW_RATE: 'm³/h',
  VOLUME: 'm³',
} as const;

/**
 * Default pagination settings
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 0,
  SIZE: 20,
  SORT: 'readingDate,desc',
} as const;

/**
 * Date range presets (in days)
 */
export const DATE_RANGE_PRESETS = {
  TODAY: 0,
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_YEAR: 365,
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  NOTES_MAX_LENGTH: 1000,
  RESOLUTION_NOTES_MAX_LENGTH: 1000,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Alert priority levels (derived from severity)
 */
export const ALERT_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

/**
 * Event duration limits (in hours)
 */
export const EVENT_DURATION_LIMITS = {
  MIN: 0,
  MAX: 8760, // 1 year
} as const;

/**
 * Forecast horizon (in days)
 */
export const FORECAST_HORIZON = {
  MIN: 1,
  MAX: 365,
  DEFAULT: 30,
} as const;

/**
 * Threshold types
 */
export const THRESHOLD_TYPES = {
  PRESSURE: 'PRESSURE',
  TEMPERATURE: 'TEMPERATURE',
  FLOW_RATE: 'FLOW_RATE',
  VOLUME: 'VOLUME',
} as const;

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  JSON: 'json',
} as const;

/**
 * Chart types for data visualization
 */
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  SCATTER: 'scatter',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_DATE_RANGE: 'End date must be after start date',
  INVALID_MEASUREMENT: 'Measurement value is out of valid range',
  INVALID_THRESHOLD: 'Minimum value must be less than maximum value',
  VOLUME_NEGATIVE: 'Volume cannot be negative',
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
  VALIDATED: 'Validated successfully',
  ACKNOWLEDGED: 'Acknowledged successfully',
  RESOLVED: 'Resolved successfully',
  COMPLETED: 'Completed successfully',
  EXPORTED: 'Exported successfully',
} as const;

/**
 * Warning messages
 */
export const WARNING_MESSAGES = {
  ANOMALY_DETECTED: 'Anomaly detected in measurement',
  THRESHOLD_BREACH: 'Threshold breach detected',
  MISSING_DATA: 'Data is missing for this period',
  LOW_QUALITY: 'Data quality is below acceptable threshold',
} as const;
