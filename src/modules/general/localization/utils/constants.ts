/**
 * Constants - General Localization Module
 * 
 * Constants for General Localization entities.
 * Updated: 01-16-2026 - Added District entity
 * 
 * @author CHOUABBIA Amine
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  COUNTRIES: '/api/general/localization/countries',
  STATES: '/api/general/localization/states',
  DISTRICTS: '/api/general/localization/districts',  // Added
  LOCALITIES: '/api/general/localization/localities',
  LOCATIONS: '/api/general/localization/locations',
  ZONES: '/api/general/localization/zones',
} as const;

/**
 * Validation constraints
 * Updated: Added District code constraints
 */
export const VALIDATION_CONSTRAINTS = {
  COUNTRY_CODE_MIN_LENGTH: 2,
  COUNTRY_CODE_MAX_LENGTH: 3,
  STATE_CODE_MIN_LENGTH: 2,
  STATE_CODE_MAX_LENGTH: 10,  // Updated from 5 to 10
  DISTRICT_CODE_MIN_LENGTH: 2,  // Added
  DISTRICT_CODE_MAX_LENGTH: 10,  // Added
  LOCALITY_CODE_MIN_LENGTH: 2,  // Added
  LOCALITY_CODE_MAX_LENGTH: 10,  // Added
  POSTAL_CODE_MIN_LENGTH: 3,
  POSTAL_CODE_MAX_LENGTH: 10,
  DESIGNATION_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 500,
  PLACE_NAME_MAX_LENGTH: 10,  // Added for Location.placeName
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  LOCALE: 'fr' as 'fr' | 'en' | 'ar',  // Added Arabic
  COORDINATE_PRECISION: 4,
  MAP_ZOOM: 10,
} as const;

/**
 * Locales
 */
export const LOCALES = {
  FRENCH: 'fr',
  ENGLISH: 'en',
  ARABIC: 'ar',  // Added
} as const;

/**
 * Sort options
 * Updated: Added District sort options
 */
export const SORT_OPTIONS = [
  { value: 'code,asc', label: 'Code (A-Z)' },
  { value: 'code,desc', label: 'Code (Z-A)' },
  { value: 'designationFr,asc', label: 'Designation FR (A-Z)' },
  { value: 'designationFr,desc', label: 'Designation FR (Z-A)' },
  { value: 'designationEn,asc', label: 'Designation EN (A-Z)' },
  { value: 'designationEn,desc', label: 'Designation EN (Z-A)' },
  { value: 'designationAr,asc', label: 'Designation AR (A-Z)' },  // Added
  { value: 'designationAr,desc', label: 'Designation AR (Z-A)' },  // Added
] as const;

/**
 * Error messages
 * Updated: Added District error messages
 */
export const ERROR_MESSAGES = {
  CODE_REQUIRED: 'Code is required',
  CODE_INVALID: 'Code format is invalid',
  COUNTRY_CODE_INVALID: 'Country code must be 2-3 uppercase letters',
  STATE_CODE_INVALID: 'State code must be 2-10 characters',
  DISTRICT_CODE_INVALID: 'District code must be 2-10 characters',  // Added
  LOCALITY_CODE_INVALID: 'Locality code must be 2-10 characters',  // Added
  DESIGNATION_FR_REQUIRED: 'French designation is required',
  DESIGNATION_EN_REQUIRED: 'English designation is required',
  DESIGNATION_AR_REQUIRED: 'Arabic designation is required',  // Added
  STATE_REQUIRED: 'State is required',  // Added
  DISTRICT_REQUIRED: 'District is required',  // Added
  LOCALITY_REQUIRED: 'Locality is required',  // Added
  POSTAL_CODE_INVALID: 'Postal code format is invalid',
  LATITUDE_INVALID: 'Latitude must be between -90 and 90',
  LONGITUDE_INVALID: 'Longitude must be between -180 and 180',
  COORDINATES_INVALID: 'Coordinates are invalid',
  PLACE_NAME_INVALID: 'Place name must not exceed 10 characters',  // Added
  SEQUENCE_REQUIRED: 'Sequence is required',  // Added
  NOT_FOUND: 'Location not found',
  ALREADY_EXISTS: 'Location already exists',
  ZONE_NAME_EXISTS: 'Zone with this name already exists',
  ZONE_CODE_EXISTS: 'Zone with this code already exists',
} as const;

/**
 * Success messages
 * Updated: Added District success messages
 */
export const SUCCESS_MESSAGES = {
  COUNTRY_CREATED: 'Country created successfully',
  COUNTRY_UPDATED: 'Country updated successfully',
  COUNTRY_DELETED: 'Country deleted successfully',
  STATE_CREATED: 'State created successfully',
  STATE_UPDATED: 'State updated successfully',
  STATE_DELETED: 'State deleted successfully',
  DISTRICT_CREATED: 'District created successfully',  // Added
  DISTRICT_UPDATED: 'District updated successfully',  // Added
  DISTRICT_DELETED: 'District deleted successfully',  // Added
  LOCALITY_CREATED: 'Locality created successfully',  // Added
  LOCALITY_UPDATED: 'Locality updated successfully',  // Added
  LOCALITY_DELETED: 'Locality deleted successfully',  // Added
  LOCATION_CREATED: 'Location created successfully',
  LOCATION_UPDATED: 'Location updated successfully',
  LOCATION_DELETED: 'Location deleted successfully',
  ZONE_CREATED: 'Zone created successfully',  // Added
  ZONE_UPDATED: 'Zone updated successfully',  // Added
  ZONE_DELETED: 'Zone deleted successfully',  // Added
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
    DISTRICT: '#00BCD4',  // Added - Cyan
    LOCALITY: '#FF9800',
    LOCATION: '#F44336',
    ZONE: '#9C27B0',
  },
} as const;

/**
 * Geographic hierarchy
 * Added: Documentation of the correct hierarchy
 */
export const HIERARCHY = {
  LEVELS: ['Country', 'State', 'District', 'Locality', 'Location'] as const,
  RELATIONSHIPS: {
    COUNTRY: { parent: null, children: null },  // Independent
    STATE: { parent: null, children: ['District'] },  // Independent, has Districts
    DISTRICT: { parent: 'State', children: ['Locality'] },  // Belongs to State
    LOCALITY: { parent: 'District', children: ['Location'] },  // Belongs to District
    LOCATION: { parent: 'Locality', children: null },  // Belongs to Locality (optional)
    ZONE: { parent: null, children: null },  // Independent
  },
} as const;
