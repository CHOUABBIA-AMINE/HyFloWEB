/**
 * Constants - Network Core Module
 * 
 * Constants specific to Network Core entities.
 * 
 * @author CHOUABBIA Amine
 * @updated 01-15-2026 - Aligned API endpoints with current DTOs
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  PIPELINES: '/api/network/core/pipelines',
  PIPELINE_SYSTEMS: '/api/network/core/pipeline-systems',
  PIPELINE_SEGMENTS: '/api/network/core/pipeline-segments',
  EQUIPMENT: '/api/network/core/equipment',
  FACILITIES: '/api/network/core/facilities',
  INFRASTRUCTURES: '/api/network/core/infrastructures',
  PROCESSING_PLANTS: '/api/network/core/processing-plants',
  PRODUCTION_FIELDS: '/api/network/core/production-fields',
  STATIONS: '/api/network/core/stations',
  TERMINALS: '/api/network/core/terminals',
} as const;

/**
 * Measurement units
 */
export const UNITS = {
  DIAMETER: 'inches',
  LENGTH: 'km',
  PRESSURE: 'bar',
  CAPACITY: 'm³/day',
  VOLUME: 'm³',
  FLOW_RATE: 'm³/h',
  TEMPERATURE: '°C',
} as const;

/**
 * Operational status codes
 */
export const OPERATIONAL_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  UNDER_CONSTRUCTION: 'UNDER_CONSTRUCTION',
} as const;

/**
 * Pipeline types
 */
export const PIPELINE_TYPES = {
  TRANSMISSION: 'TRANSMISSION',
  GATHERING: 'GATHERING',
  DISTRIBUTION: 'DISTRIBUTION',
} as const;

/**
 * Equipment types
 */
export const EQUIPMENT_TYPES = {
  PUMP: 'PUMP',
  COMPRESSOR: 'COMPRESSOR',
  VALVE: 'VALVE',
  METER: 'METER',
  SEPARATOR: 'SEPARATOR',
  HEAT_EXCHANGER: 'HEAT_EXCHANGER',
} as const;

/**
 * Facility types
 */
export const FACILITY_TYPES = {
  PUMPING_STATION: 'PUMPING_STATION',
  COMPRESSION_STATION: 'COMPRESSION_STATION',
  METERING_STATION: 'METERING_STATION',
  VALVE_STATION: 'VALVE_STATION',
} as const;

/**
 * Station types
 */
export const STATION_TYPES = {
  COMPRESSION: 'COMPRESSION',
  PUMPING: 'PUMPING',
  METERING: 'METERING',
  REGULATION: 'REGULATION',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  CODE_MAX_LENGTH: 20,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  SERIAL_NUMBER_MIN_LENGTH: 5,
  SERIAL_NUMBER_MAX_LENGTH: 50,
  MIN_DIAMETER: 0.1,
  MAX_DIAMETER: 100,
  MIN_PRESSURE: 0,
  MAX_PRESSURE: 1000,
  MIN_YEAR: 1900,
  MAX_YEAR: new Date().getFullYear() + 10,
} as const;

/**
 * Map configuration
 */
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 6,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  DEFAULT_CENTER: {
    latitude: 28.0339,  // Algeria center
    longitude: 1.6596,
  },
  MARKER_COLORS: {
    PIPELINE: '#1976D2',
    FACILITY: '#388E3C',
    STATION: '#F57C00',
    TERMINAL: '#D32F2F',
    FIELD: '#7B1FA2',
  },
} as const;

/**
 * Chart colors
 */
export const CHART_COLORS = {
  PRIMARY: '#1976D2',
  SECONDARY: '#388E3C',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
} as const;

/**
 * Date range presets
 */
export const DATE_RANGE_PRESETS = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
  LAST_90_DAYS: 90,
  LAST_YEAR: 365,
} as const;

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
  JSON: 'json',
} as const;
