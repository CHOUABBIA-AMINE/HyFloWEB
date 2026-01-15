/**
 * Constants - Network Type Module
 * 
 * Constants for Network Type entities.
 * 
 * @author CHOUABBIA Amine
 * @updated 01-15-2026 - Aligned with current DTOs: removed HYDROCARBON_FIELD_TYPES, added PROCESSING_PLANT_TYPES and PRODUCTION_FIELD_TYPES
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  COMPANY_TYPES: '/api/network/type/company-types',
  EQUIPMENT_TYPES: '/api/network/type/equipment-types',
  FACILITY_TYPES: '/api/network/type/facility-types',
  PARTNER_TYPES: '/api/network/type/partner-types',
  PROCESSING_PLANT_TYPES: '/api/network/type/processing-plant-types',
  PRODUCTION_FIELD_TYPES: '/api/network/type/production-field-types',
  STATION_TYPES: '/api/network/type/station-types',
  TERMINAL_TYPES: '/api/network/type/terminal-types',
  VENDOR_TYPES: '/api/network/type/vendor-types',
} as const;

/**
 * Equipment type categories
 */
export const EQUIPMENT_TYPE_CATEGORIES = {
  PUMP: 'PUMP',
  COMPRESSOR: 'COMPRESSOR',
  VALVE: 'VALVE',
  METER: 'METER',
  SEPARATOR: 'SEPARATOR',
  HEAT_EXCHANGER: 'HEAT_EXCHANGER',
  TANK: 'TANK',
  PRESSURE_VESSEL: 'PRESSURE_VESSEL',
} as const;

/**
 * Facility type categories
 */
export const FACILITY_TYPE_CATEGORIES = {
  PUMPING_STATION: 'PUMPING_STATION',
  COMPRESSION_STATION: 'COMPRESSION_STATION',
  METERING_STATION: 'METERING_STATION',
  VALVE_STATION: 'VALVE_STATION',
  PROCESSING_PLANT: 'PROCESSING_PLANT',
  STORAGE_FACILITY: 'STORAGE_FACILITY',
} as const;

/**
 * Company type categories
 */
export const COMPANY_TYPE_CATEGORIES = {
  NATIONAL_OIL_COMPANY: 'NATIONAL_OIL_COMPANY',
  PRIVATE_COMPANY: 'PRIVATE_COMPANY',
  JOINT_VENTURE: 'JOINT_VENTURE',
  SERVICE_COMPANY: 'SERVICE_COMPANY',
  CONSULTING_FIRM: 'CONSULTING_FIRM',
} as const;

/**
 * Production field type categories (replaces hydrocarbon field types)
 */
export const PRODUCTION_FIELD_TYPE_CATEGORIES = {
  OIL_FIELD: 'OIL_FIELD',
  GAS_FIELD: 'GAS_FIELD',
  CONDENSATE_FIELD: 'CONDENSATE_FIELD',
  MIXED_FIELD: 'MIXED_FIELD',
} as const;

/**
 * Processing plant type categories
 */
export const PROCESSING_PLANT_TYPE_CATEGORIES = {
  REFINERY: 'REFINERY',
  GAS_PROCESSING_PLANT: 'GAS_PROCESSING_PLANT',
  LNG_PLANT: 'LNG_PLANT',
  PETROCHEMICAL_PLANT: 'PETROCHEMICAL_PLANT',
  FRACTIONATION_PLANT: 'FRACTIONATION_PLANT',
} as const;

/**
 * Partner type categories
 */
export const PARTNER_TYPE_CATEGORIES = {
  OPERATOR: 'OPERATOR',
  CONTRACTOR: 'CONTRACTOR',
  SUPPLIER: 'SUPPLIER',
  CONSULTANT: 'CONSULTANT',
  JOINT_VENTURE_PARTNER: 'JOINT_VENTURE_PARTNER',
} as const;

/**
 * Station type categories
 */
export const STATION_TYPE_CATEGORIES = {
  COMPRESSION: 'COMPRESSION',
  PUMPING: 'PUMPING',
  METERING: 'METERING',
  REGULATION: 'REGULATION',
  DISTRIBUTION: 'DISTRIBUTION',
} as const;

/**
 * Terminal type categories
 */
export const TERMINAL_TYPE_CATEGORIES = {
  LNG_TERMINAL: 'LNG_TERMINAL',
  EXPORT_TERMINAL: 'EXPORT_TERMINAL',
  IMPORT_TERMINAL: 'IMPORT_TERMINAL',
  STORAGE_TERMINAL: 'STORAGE_TERMINAL',
  DISTRIBUTION_TERMINAL: 'DISTRIBUTION_TERMINAL',
} as const;

/**
 * Vendor type categories
 */
export const VENDOR_TYPE_CATEGORIES = {
  MANUFACTURER: 'MANUFACTURER',
  DISTRIBUTOR: 'DISTRIBUTOR',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
  CONTRACTOR: 'CONTRACTOR',
  CONSULTANT: 'CONSULTANT',
} as const;

/**
 * Validation constraints for type entities
 */
export const TYPE_VALIDATION_CONSTRAINTS = {
  CODE_MAX_LENGTH: 20,
  DESIGNATION_FR_MAX_LENGTH: 100,
  DESIGNATION_EN_MAX_LENGTH: 100,
  DESIGNATION_AR_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Type entity display colors
 */
export const TYPE_COLORS = {
  COMPANY_TYPE: '#7B1FA2',
  EQUIPMENT_TYPE: '#1976D2',
  FACILITY_TYPE: '#388E3C',
  PARTNER_TYPE: '#0097A7',
  PROCESSING_PLANT_TYPE: '#FF6F00',
  PRODUCTION_FIELD_TYPE: '#F57C00',
  STATION_TYPE: '#C2185B',
  TERMINAL_TYPE: '#D32F2F',
  VENDOR_TYPE: '#303F9F',
} as const;
