/**
 * Formatter Utilities - General Localization Module
 * 
 * Formatting functions for General Localization entities.
 * 
 * @author CHOUABBIA Amine
 */

import { toTitleCase, truncate } from '../../common/utils/formatters';

/**
 * Format designation by locale
 */
export const formatDesignation = (
  designationFr: string | undefined | null,
  designationEn: string | undefined | null,
  locale: 'fr' | 'en' = 'fr'
): string => {
  const designation = locale === 'fr' ? designationFr : designationEn;
  if (!designation) return '-';
  return toTitleCase(designation);
};

/**
 * Format country code (uppercase)
 */
export const formatCountryCode = (code: string | undefined | null): string => {
  if (!code) return '-';
  return code.toUpperCase();
};

/**
 * Format state code (uppercase)
 */
export const formatStateCode = (code: string | undefined | null): string => {
  if (!code) return '-';
  return code.toUpperCase();
};

/**
 * Format postal code
 */
export const formatPostalCode = (postalCode: string | undefined | null): string => {
  if (!postalCode) return '-';
  return postalCode.toUpperCase();
};

/**
 * Format coordinates
 */
export const formatCoordinates = (
  latitude: number | undefined | null,
  longitude: number | undefined | null,
  precision: number = 4
): string => {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return '-';
  }
  
  const lat = latitude.toFixed(precision);
  const lon = longitude.toFixed(precision);
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(Number(lat))}° ${latDir}, ${Math.abs(Number(lon))}° ${lonDir}`;
};

/**
 * Format latitude
 */
export const formatLatitude = (latitude: number | undefined | null, precision: number = 4): string => {
  if (latitude === undefined || latitude === null) return '-';
  const dir = latitude >= 0 ? 'N' : 'S';
  return `${Math.abs(latitude).toFixed(precision)}° ${dir}`;
};

/**
 * Format longitude
 */
export const formatLongitude = (longitude: number | undefined | null, precision: number = 4): string => {
  if (longitude === undefined || longitude === null) return '-';
  const dir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(longitude).toFixed(precision)}° ${dir}`;
};

/**
 * Format full address
 */
export const formatFullAddress = (
  placeName: string | undefined | null,
  localityName: string | undefined | null,
  stateName: string | undefined | null,
  countryName: string | undefined | null
): string => {
  const parts = [placeName, localityName, stateName, countryName].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '-';
};

/**
 * Format location label (code + designation)
 */
export const formatLocationLabel = (
  code: string | undefined | null,
  designation: string | undefined | null
): string => {
  if (!code && !designation) return '-';
  if (!code) return designation || '-';
  if (!designation) return code;
  return `${code} - ${designation}`;
};

// Re-export common formatters
export { toTitleCase, truncate };
