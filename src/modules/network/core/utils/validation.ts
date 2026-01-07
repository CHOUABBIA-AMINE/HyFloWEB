/**
 * Validation Utilities - Network Core Module
 * 
 * Validation functions specific to Network Core entities.
 * Extends common validations with domain-specific rules.
 * 
 * @author CHOUABBIA Amine
 */

import {
  isNotEmpty,
  isValidCode,
  isPositive,
  isNonNegative,
} from '../../common/utils/validation';

/**
 * Validate pipeline code format (e.g., GR1, OZ1)
 */
export const isValidPipelineCode = (code: string): boolean => {
  return /^[A-Z]{2}\d+$/.test(code);
};

/**
 * Validate equipment serial number format
 */
export const isValidSerialNumber = (serialNumber: string): boolean => {
  return isNotEmpty(serialNumber) && serialNumber.length >= 5;
};

/**
 * Validate diameter value (must be positive)
 */
export const isValidDiameter = (diameter: number | undefined | null): boolean => {
  return diameter !== undefined && diameter !== null && isPositive(diameter);
};

/**
 * Validate length value (must be non-negative)
 */
export const isValidLength = (length: number | undefined | null): boolean => {
  return length !== undefined && length !== null && isNonNegative(length);
};

/**
 * Validate pressure value (must be non-negative)
 */
export const isValidPressure = (pressure: number | undefined | null): boolean => {
  return pressure !== undefined && pressure !== null && isNonNegative(pressure);
};

/**
 * Validate capacity value (must be positive)
 */
export const isValidCapacity = (capacity: number | undefined | null): boolean => {
  return capacity !== undefined && capacity !== null && isPositive(capacity);
};

/**
 * Validate coordinates (latitude/longitude)
 */
export const isValidCoordinate = (
  latitude: number | undefined | null,
  longitude: number | undefined | null
): boolean => {
  if (latitude === undefined || latitude === null) return false;
  if (longitude === undefined || longitude === null) return false;
  
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

/**
 * Validate date range (start must be before end)
 */
export const isValidDateRange = (
  startDate: Date | string | undefined | null,
  endDate: Date | string | undefined | null
): boolean => {
  if (!startDate || !endDate) return true; // Optional dates
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return start <= end;
};

/**
 * Validate year value
 */
export const isValidYear = (year: number | undefined | null): boolean => {
  if (year === undefined || year === null) return true; // Optional
  
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 10;
};

// Re-export common validations
export { isNotEmpty, isValidCode, isPositive, isNonNegative };
