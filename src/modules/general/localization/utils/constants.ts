/**
 * Constants - General Localization Module
 * 
 * Constants for General Localization entities.
 * 
 * @author CHOUABBIA Amine
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  COUNTRIES: '/api/general/localization/countries',
  STATES: '/api/general/localization/states',
  LOCALITIES: '/api/general/localization/localities',
  LOCATIONS: '/api/general/localization/locations',
  ZONES: '/api/general/localization/zones',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  COUNTRY_CODE_MIN_LENGTH: 2,
  COUNTRY_CODE_MAX_LENGTH: 3,
  STATE_CODE_MIN_LENGTH: 2,
  STATE_CODE_MAX_LENGTH: 5,
  POSTAL_CODE_MIN_LENGTH: 3,
  POSTAL_CODE_MAX_LENGTH: 10,
  DESIGNATION_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 500,
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  LOCALE: 'fr' as 'fr' | 'en',
  COORDINATE_PRECISION: 4,
  MAP_ZOOM: 10,
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
  CODE_INVALID: 'Code format is invalid',
  COUNTRY_CODE_INVALID: 'Country code must be 2-3 uppercase letters',
  STATE_CODE_INVALID: 'State code must be 2-5 uppercase letters/numbers',
  DESIGNATION_FR_REQUIRED: 'French designation is required',
  DESIGNATION_EN_REQUIRED: 'English designation is required',
  POSTAL_CODE_INVALID: 'Postal code format is invalid',
  LATITUDE_INVALID: 'Latitude must be between -90 and 90',
  LONGITUDE_INVALID: 'Longitude must be between -180 and 180',
  COORDINATES_INVALID: 'Coordinates are invalid',
  NOT_FOUND: 'Location not found',
  ALREADY_EXISTS: 'Location already exists',
  ZONE_NAME_EXISTS: 'Zone with this name already exists',
  ZONE_CODE_EXISTS: 'Zone with this code already exists',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Location created successfully',
  UPDATED: 'Location updated successfully',
  DELETED: 'Location deleted successfully',
} as const;

/**
 * Map configuration
 */
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 36.7538, lng: 3.0588 }, // Algiers
  DEFAULT_ZOOM: 10,
  MIN_ZOOM: 1,
  MAX_ZOOM: 18,
  MARKER_COLORS: {
    COUNTRY: '#4CAF50',
    STATE: '#2196F3',
    LOCALITY: '#FF9800',
    LOCATION: '#F44336',
    ZONE: '#9C27B0',
  },
} as const;
