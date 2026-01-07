/**
 * Validation Utilities - General Localization Module
 * 
 * Validation functions for General Localization entities.
 * 
 * @author CHOUABBIA Amine
 */

import { isNotEmpty } from '../../common/utils/validation';

/**
 * Validate country code (ISO format: 2-3 uppercase letters)
 */
export const isValidCountryCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z]{2,3}$/.test(code!);
};

/**
 * Validate state code
 */
export const isValidStateCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z0-9]{2,5}$/.test(code!);
};

/**
 * Validate locality code
 */
export const isValidLocalityCode = (code: string | undefined | null): boolean => {
  return isNotEmpty(code);
};

/**
 * Validate zone code
 */
export const isValidZoneCode = (code: string | undefined | null): boolean => {
  if (!isNotEmpty(code)) return false;
  return /^[A-Z0-9_-]+$/.test(code!);
};

/**
 * Validate postal code
 */
export const isValidPostalCode = (postalCode: string | undefined | null): boolean => {
  if (!postalCode) return true; // Optional
  return /^[A-Z0-9\s-]{3,10}$/.test(postalCode);
};

/**
 * Validate latitude
 */
export const isValidLatitude = (latitude: number | undefined | null): boolean => {
  if (latitude === undefined || latitude === null) return true; // Optional
  return latitude >= -90 && latitude <= 90;
};

/**
 * Validate longitude
 */
export const isValidLongitude = (longitude: number | undefined | null): boolean => {
  if (longitude === undefined || longitude === null) return true; // Optional
  return longitude >= -180 && longitude <= 180;
};

/**
 * Validate coordinates (latitude and longitude)
 */
export const isValidCoordinates = (
  latitude: number | undefined | null,
  longitude: number | undefined | null
): boolean => {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
};

/**
 * Validate designation (French or English)
 */
export const isValidDesignation = (designation: string | undefined | null): boolean => {
  return isNotEmpty(designation);
};

/**
 * Validate place name
 */
export const isValidPlaceName = (placeName: string | undefined | null): boolean => {
  return isNotEmpty(placeName);
};

// Re-export common validations
export { isNotEmpty };
